'use strict';

const os = require('os');
const path = require('path');
const { appendFileSync, mkdirSync, writeFileSync } = require('fs');
const uncommonjs = require('@leonid-shutov/uncommonjs');

// The renderer owns the terminal, so `console` has to go to a file. XDG resolution is
// duplicated here (see src/1-config/(common)/paths.js) because this runs before the app.
const stateHome = process.env.XDG_STATE_HOME || path.join(os.homedir(), '.local', 'state');
const LOG_FILE = process.env.TUIGRAM_LOG || path.join(stateHome, 'tuigram', 'tuigram.log');

mkdirSync(path.dirname(LOG_FILE), { recursive: true, mode: 0o700 });
writeFileSync(LOG_FILE, '', { mode: 0o600 }); // truncate on startup

function formatArgs(args) {
  return args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ');
}

function writeLog(...args) {
  const line = `${formatArgs(args)}\n`;
  appendFileSync(LOG_FILE, line);
}

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
  const tui = await import('@opentui/core');
  const rootDir = path.resolve(__dirname);
  const context = { console: mockConsole, tui, process, AbortController };
  await uncommonjs.loadApplication(context, { rootDir });
})();
