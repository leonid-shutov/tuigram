'use strict';

const { spawn } = require('child_process');
const https = require('https');
const { TelegramClient } = require('./mtcute');

// Every way src/ reaches outside its own process; test/world.js swaps it (docs/decisions/0002).
const createWorld = async () => {
  const tui = await import('@opentui/core');
  return {
    terminal: { createRenderer: (config) => tui.createCliRenderer(config) },
    telegram: { Client: TelegramClient },
    spawn,
    https: { get: https.get },
  };
};

module.exports = { createWorld };
