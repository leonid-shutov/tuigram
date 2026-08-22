#!/usr/bin/env node
'use strict';

// opentui talks to its Zig backend through node:ffi, which Node only exposes behind
// --experimental-ffi. An installed `tuigram` cannot ask the user to type that, so re-exec
// ourselves with it; RELAUNCH guards against a loop if the flag is ignored. (opentui's own
// error also names --allow-ffi, but that is a permission-model flag: passing it without
// --permission is fatal on Node >= 24, and node:ffi does not need it otherwise.)
const { spawnSync } = require('child_process');
const path = require('path');

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

const entry = path.join(__dirname, '..', 'tuigram.js');
const hasFfi = FFI_FLAGS.every((flag) => process.execArgv.includes(flag));

if (hasFfi || process.env[RELAUNCH] === '1') {
  require(entry);
} else {
  const argv = [...process.execArgv, ...FFI_FLAGS, entry, ...args];
  const env = { ...process.env, [RELAUNCH]: '1' };
  const { status, error } = spawnSync(process.execPath, argv, { stdio: 'inherit', env });
  if (error) {
    process.stderr.write(`tuigram: ${error.message}\n`);
    process.exit(1);
  }
  process.exit(status ?? 0);
}
