'use strict';

const path = require('path');
const { appendFileSync, writeFileSync } = require('fs');
const uncommonjs = require('@leonid-shutov/uncommonjs');
const tui = await import('@opentui/core');

const LOG_FILE = 'app.log';
writeFileSync(LOG_FILE, ''); // truncate on startup

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

process.on('unhandledRejection', (reason, promise) => {
  mockConsole.log(reason.message);
});

process.on('uncaughtException', (error) => {
  mockConsole.log(error.message);
});

const rootDir = path.resolve(__dirname);
const context = { console: mockConsole, tui, process, Buffer, setTimeout, clearTimeout };
uncommonjs.loadApplication(context, { rootDir });
