'use strict';

const os = require('os');
const path = require('path');
const { appendFileSync, mkdirSync, writeFileSync } = require('fs');
const { loadTree } = require('@leonid-shutov/uncommonjs');
const { createContext, RESTARTED } = require('./context');
const { createWorld } = require('./world');
const pkg = require('../package.json');

const ISSUES_URL = pkg.bugs.url;

/**
 * The app, in this process, in the real world with `overrides` swapped in: none for
 * bin/tuigram.js, the fake Telegram for demo/run.js. Needs FFI (--experimental-ffi), and owns the
 * process from here on: its log, its crash report, its exit.
 */
const run = async (overrides = {}) => {
  // The renderer owns the terminal, so `console` has to go to a file. XDG resolution is
  // duplicated here (see src/01-config/01-paths.js) because this runs before the app.
  const stateHome = process.env.XDG_STATE_HOME || path.join(os.homedir(), '.local', 'state');
  const logFile = process.env.TUIGRAM_LOG || path.join(stateHome, 'tuigram', 'tuigram.log');

  mkdirSync(path.dirname(logFile), { recursive: true, mode: 0o700 });
  // Truncate on startup, but keep one session's log across restarts.
  if (process.env[RESTARTED] !== '1') writeFileSync(logFile, '', { mode: 0o600 });

  const formatArgs = (args) =>
    args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ');

  const writeLog = (...args) => {
    const line = `${formatArgs(args)}\n`;
    appendFileSync(logFile, line);
  };

  const console = {
    log: (...args) => writeLog(...args),
    error: (...args) => writeLog(...args),
  };

  // Injected into the VM context below so src/(common)/Crash/hard.js can print the identical
  // report for a runtime crash — this runs before that VM exists, so it can't import from there.
  const crashReport = (label, detail) => {
    console.log(label, detail);
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
        `  log:    ${logFile}`,
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

  const rootDir = path.resolve(__dirname, '..');
  const real = await createWorld();
  const world = { ...real, ...overrides };
  const context = await createContext({ world, console, process, crashReport });
  await loadTree(context, { rootDir });
};

module.exports = { run };
