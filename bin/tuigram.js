#!/usr/bin/env node
'use strict';

const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { appendFileSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } = require('fs');
const channel = require('./channel');
const { createContext, RESTART, UPGRADE, UPGRADE_FILE } = require('./context');
const { upgrade } = require('./upgrade');
const { createWorld } = require('./world');
const pkg = require('../package.json');

const RELAUNCH = 'TUIGRAM_RELAUNCHED';
// Node writes its warnings to stderr, over the renderer's screen: they go to the log instead (below).
const NODE_FLAGS = ['--experimental-ffi', '--no-warnings', '--optimize-for-size'];
const RESTARTED = 'TUIGRAM_RESTARTED';

const args = process.argv.slice(2);

// XDG resolution is duplicated here (see src/01-config/mechanics/computePaths.js) because this
// runs before the app.
const stateHome = process.env.XDG_STATE_HOME || path.join(os.homedir(), '.local', 'state');

if (args.includes('--help') || args.includes('-h')) {
  process.stdout.write(
    [
      'tuigram — a terminal client for Telegram',
      '',
      'Usage: tuigram [command]',
      '',
      'Commands:',
      '  logout           sign out and delete the stored session',
      '  upgrade          check for and install a newer release',
      '',
      'Options:',
      '  -h, --help       show this message',
      '  -v, --version    show the version',
      '',
      'tuigram ships a Telegram app key. To use your own (https://my.telegram.org),',
      'set TUIGRAM_API_ID / TUIGRAM_API_HASH or $XDG_CONFIG_HOME/tuigram/credentials.json.',
      '',
    ].join('\n'),
  );
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  process.stdout.write(`${pkg.version}\n`);
  process.exit(0);
}

const rootDir = realpathSync(path.resolve(__dirname, '..'));

// This never boots the renderer or the sandbox, so it runs here rather than through
// src/(common)/Update/ (which loads after 02-screen and 03-auth, so a subcommand routed
// through it would need working FFI, a working opentui and a valid session — exactly the states
// where someone most needs to upgrade). No version check either: both upgrade commands are
// already idempotent, so this is a plain detect-channel-and-spawn, reusing channel.upgradePlan
// (the same recipe src/(common)/Update/upgradePlan.js drives in-app) instead of its own copy.
if (args[0] === 'upgrade') {
  if (channel.detect(rootDir) === 'git') {
    process.stderr.write('tuigram: this is a git checkout, not an installed copy — nothing to upgrade\n');
    process.exit(1);
  }
  process.exit(upgrade(rootDir, 'latest'));
}

// What the app wrote before exiting with UPGRADE, or `null` when the file is missing or isn't
// what src/08-actions/upgrade.js writes. The version ends up in `npm install tuigram@<version>`,
// where anything but a plain version (a URL, `npm:other-package`) would install something else.
const VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u;
/** @param {string} file @returns {{ from: string; to: string } | null} */
const readUpgrade = (file) => {
  try {
    const { from, to } = JSON.parse(readFileSync(file, 'utf8'));
    return typeof from === 'string' && VERSION.test(to) ? { from, to } : null;
  } catch {
    return null;
  }
};

// The app has exited, so nothing holds its files; run the upgrade it asked for. No starting it
// again afterwards: brew and mise install each version in its own folder (brew deletes the old
// one), and the installer may switch Node -- this process would start a path that is gone, or
// the new code on the old Node, whose ABI better_sqlite3.node no longer matches.
/** @param {string} file @returns {number} */
const runUpgrade = (file) => {
  const requested = readUpgrade(file);
  // Gone before the upgrade starts, so a ctrl+c that kills this process too leaves nothing behind.
  rmSync(file, { force: true });
  if (requested === null) {
    process.stderr.write('tuigram: the update did not start; run `tuigram upgrade`\n');
    return 1;
  }
  process.stderr.write(`\ntuigram: updating ${requested.from} -> ${requested.to}\n\n`);
  const status = upgrade(rootDir, requested.to);
  process.stderr.write(
    status === 0
      ? `tuigram: updated to ${requested.to}; start tuigram again\n`
      : `tuigram: the update failed (exit ${status}); to try again, run \`tuigram upgrade\`\n`,
  );
  return status;
};

// opentui talks to its Zig backend through node:ffi, which Node only exposes behind
// --experimental-ffi. An installed `tuigram` cannot ask the user to type that, so re-exec
// ourselves with it; RELAUNCH guards against a loop if the flag is ignored. (opentui's own
// error also names --allow-ffi, but that is a permission-model flag: passing it without
// --permission is fatal on Node >= 24, and node:ffi does not need it otherwise.)
// The parent stays around even when the flag is already there: it starts the app again whenever
// it exits with RESTART, and runs the upgrade when it exits with UPGRADE.
if (process.env[RELAUNCH] !== '1') {
  const missing = NODE_FLAGS.filter((flag) => !process.execArgv.includes(flag));
  const argv = [...process.execArgv, ...missing, __filename, ...args];
  // Per process, so two open copies don't read each other's; in the state dir, which only this
  // user can write, and not the shared temp dir (see VERSION above).
  const upgradeFile = path.join(stateHome, 'tuigram', `upgrade-${process.pid}.json`);
  const exit = (code) => {
    rmSync(upgradeFile, { force: true });
    process.exit(code);
  };
  let env = { ...process.env, [RELAUNCH]: '1', [UPGRADE_FILE]: upgradeFile };
  for (;;) {
    const { status, error } = spawnSync(process.execPath, argv, { stdio: 'inherit', env });
    if (error) {
      process.stderr.write(`tuigram: ${error.message}\n`);
      exit(1);
    }
    if (status === UPGRADE) exit(runUpgrade(upgradeFile));
    if (status !== RESTART) exit(status ?? 0);
    env = { ...env, [RESTARTED]: '1' };
  }
}

// Past this point we have FFI, so the app can actually boot. Nothing below must run in the
// pre-relaunch parent: it truncates the log and loads opentui.

// The renderer owns the terminal, so `console` has to go to a file.
const LOG_FILE = process.env.TUIGRAM_LOG || path.join(stateHome, 'tuigram', 'tuigram.log');

mkdirSync(path.dirname(LOG_FILE), { recursive: true, mode: 0o700 });
// Truncate on startup, but keep one session's log across restarts.
if (process.env[RESTARTED] !== '1') writeFileSync(LOG_FILE, '', { mode: 0o600 });

const formatArgs = (args) =>
  args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ');

const writeLog = (...args) => {
  const line = `${formatArgs(args)}\n`;
  appendFileSync(LOG_FILE, line);
};

const mockConsole = {
  log: (...args) => writeLog(...args),
  error: (...args) => writeLog(...args),
};

const ISSUES_URL = pkg.bugs.url;

// Injected into the VM context below so src/(common)/Crash/hard.js can print the identical
// report for a runtime crash — this runs before that VM exists, so it can't import from there.
const crashReport = (label, detail) => {
  mockConsole.log(label, detail);
  process.stderr.write(
    [
      '',
      `tuigram: ${label}`,
      '',
      detail
        .split('\n')
        .map((line) => `  ${line}`)
        .join('\n'),
      '',
      `  log:    ${LOG_FILE}`,
      `  report: ${ISSUES_URL}`,
      '',
    ].join('\n'),
  );
};

const bootCrash = (label, error) => {
  crashReport(label, error?.stack ?? String(error));
  process.exit(1);
};

process.on('warning', (warning) => mockConsole.log('warning', warning.stack ?? String(warning)));
process.on('unhandledRejection', (reason) => bootCrash('unhandled', reason));
process.on('uncaughtException', (error) => bootCrash('uncaught', error));

(async () => {
  const uncommonjs = require('@leonid-shutov/uncommonjs');
  const rootDir = path.resolve(__dirname, '..');
  const world = await createWorld();
  const context = await createContext({ world, console: mockConsole, process, crashReport });
  await uncommonjs.loadTree(context, { rootDir });
})();
