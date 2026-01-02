'use strict';

const uncommonjs = require('@leonid-shutov/uncommonjs');
const blessed = require('blessed');

process.on('unhandledRejection', (reason, promise) => {
  console.dir({ promise });
  console.dir({ reason });
});

process.on('uncaughtException', (...args) => {
  console.dir({ args });
});

(async () => {
  await uncommonjs.loadApplication({
    console,
    blessed,
    process,
  });
})();
