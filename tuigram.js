'use strict';

const uncommonjs = require('@leonid-shutov/uncommonjs');
const blessed = require('blessed');
const { writeFileSync, appendFileSync } = require('fs');

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
  console.dir({ promise });
  console.dir({ reason });
});

process.on('uncaughtException', (...args) => {
  console.dir({ args });
});

(async () => {
  await uncommonjs.loadApplication({
    console: mockConsole,
    blessed,
    process,
  });
})();
