#!/usr/bin/env node
'use strict';

const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { appendFileSync, mkdirSync, realpathSync, writeFileSync } = require('fs');
const channel = require('./channel');
const pkg = require('../package.json');

const RELAUNCH = 'TUIGRAM_RELAUNCHED';
const FFI_FLAGS = ['--experimental-ffi'];

const args = process.argv.slice(2);

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
      'On first run tuigram asks for your own Telegram api_id / api_hash',
      '(https://my.telegram.org) and stores them under $XDG_CONFIG_HOME/tuigram.',
      '',
    ].join('\n'),
  );
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  process.stdout.write(`${pkg.version}\n`);
  process.exit(0);
}

// This never boots the renderer or the sandbox, so it runs here rather than through
// src/(common)/Update/ (which loads after 02-screen and 03-auth, so a subcommand routed
// through it would need working FFI, a working opentui and a valid session — exactly the states
// where someone most needs to upgrade). No version check either: both upgrade commands are
// already idempotent, so this is a plain detect-channel-and-spawn, reusing channel.upgradePlan
// (the same recipe src/(common)/Update/upgradePlan.js drives in-app) instead of its own copy.
if (args[0] === 'upgrade') {
  const rootDir = realpathSync(path.resolve(__dirname, '..'));
  const run = (cmd, cmdArgs) => spawnSync(cmd, cmdArgs, { stdio: 'inherit' }).status ?? 1;
  const kind = channel.detect(rootDir);

  if (kind === 'git') {
    process.stderr.write('tuigram: this is a git checkout, not an installed copy — nothing to upgrade\n');
    process.exit(1);
  } else if (kind === 'unknown') {
    process.stderr.write('tuigram: could not tell how this copy was installed\n');
    process.exit(1);
  } else {
    const installPlan = channel.upgradePlan(rootDir, 'latest');
    let status = 0;
    for (const step of installPlan.steps) {
      status = run(step.cmd, step.args);
      if (status !== 0) break;
    }
    process.exit(status);
  }
}

// opentui talks to its Zig backend through node:ffi, which Node only exposes behind
// --experimental-ffi. An installed `tuigram` cannot ask the user to type that, so re-exec
// ourselves with it; RELAUNCH guards against a loop if the flag is ignored. (opentui's own
// error also names --allow-ffi, but that is a permission-model flag: passing it without
// --permission is fatal on Node >= 24, and node:ffi does not need it otherwise.)
const hasFfi = FFI_FLAGS.every((flag) => process.execArgv.includes(flag));

if (!hasFfi && process.env[RELAUNCH] !== '1') {
  const argv = [...process.execArgv, ...FFI_FLAGS, __filename, ...args];
  const env = { ...process.env, [RELAUNCH]: '1' };
  const { status, error } = spawnSync(process.execPath, argv, { stdio: 'inherit', env });
  if (error) {
    process.stderr.write(`tuigram: ${error.message}\n`);
    process.exit(1);
  }
  process.exit(status ?? 0);
}

// Past this point we have FFI, so the app can actually boot. Nothing below must run in the
// pre-relaunch parent: it truncates the log and loads opentui.

// The renderer owns the terminal, so `console` has to go to a file. XDG resolution is
// duplicated here (see src/01-config/mechanics/computePaths.js) because this runs before the app.
const stateHome = process.env.XDG_STATE_HOME || path.join(os.homedir(), '.local', 'state');
const LOG_FILE = process.env.TUIGRAM_LOG || path.join(stateHome, 'tuigram', 'tuigram.log');

mkdirSync(path.dirname(LOG_FILE), { recursive: true, mode: 0o700 });
writeFileSync(LOG_FILE, '', { mode: 0o600 }); // truncate on startup

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

process.on('unhandledRejection', (reason) => bootCrash('unhandled', reason));
process.on('uncaughtException', (error) => bootCrash('uncaught', error));

(async () => {
  const uncommonjs = require('@leonid-shutov/uncommonjs');
  const tui = await import('@opentui/core');
  // uncommonjs's `npm` global only carries top-level package names, so the keymap's subpath
  // exports have to come in through the sandbox the way `tui` does.
  const Keymap = {
    host: await import('@opentui/keymap/opentui'),
    extras: await import('@opentui/keymap/extras'),
  };
  const rootDir = path.resolve(__dirname, '..');
  const context = {
    console: mockConsole,
    tui,
    Keymap,
    process,
    AbortController,
    crashReport,
    Channel: channel,
    packageVersion: pkg.version,
  };
  await uncommonjs.loadTree(context, { rootDir });
})();
