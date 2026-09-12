#!/usr/bin/env node
'use strict';

const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { appendFileSync, mkdirSync, writeFileSync } = require('fs');

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
  process.stdout.write(`${require('../package.json').version}\n`);
  process.exit(0);
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
// duplicated here (see src/1-config/(common)/paths.js) because this runs before the app.
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
};

process.on('unhandledRejection', (reason) => {
  mockConsole.log(reason.message, reason.stack);
});

process.on('uncaughtException', (error) => {
  mockConsole.log(error.message);
});

(async () => {
  const uncommonjs = require('@leonid-shutov/uncommonjs');
  const tui = await import('@opentui/core');
  const rootDir = path.resolve(__dirname, '..');
  const context = { console: mockConsole, tui, process, AbortController };
  await uncommonjs.loadApplication(context, { rootDir });
})();
