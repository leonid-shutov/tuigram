'use strict';

const { EventEmitter } = require('node:events');
const { TelegramClient } = require('../bin/mtcute.js');

// A program that starts and exits 0 on the next turn, whatever it was asked to run.
const finishedChild = () => {
  const child = new EventEmitter();
  child.unref = () => child;
  setImmediate(() => child.emit('exit', 0));
  return child;
};

// A request that fails on the next turn, as with no network: what Fetch/once.js resolves `null` for.
const failedRequest = (url) => {
  const request = new EventEmitter();
  request.destroy = () => request;
  setImmediate(() => request.emit('error', new Error(`no network in tests: ${url}`)));
  return request;
};

/** The test version of bin/world.js: nothing spawned or fetched leaves the process. */
const createTestWorld = async ({ telegram, width, height }) => {
  const { createTestRenderer } = await import('@opentui/core/testing');
  // The test renderer's setup (frame capture, mock keys), once the app has asked for it.
  const terminal = { setup: null };
  const spawned = [];
  const fetched = [];

  const world = {
    terminal: {
      createRenderer: async (config) => {
        terminal.setup = await createTestRenderer({ ...config, width, height });
        return terminal.setup.renderer;
      },
    },
    telegram: {
      // src/ passes the options for a real connection (key, session file, proxy); a client on
      // the fake needs none of them.
      Client: class extends TelegramClient {
        constructor() {
          super({ client: telegram.client });
        }
      },
    },
    spawn: (cmd, args) => {
      // Copied out of the sandbox's realm (docs/TESTING.md, Gotchas).
      spawned.push({ cmd, args: [...args] });
      return finishedChild();
    },
    https: {
      get: (url) => {
        fetched.push(String(url));
        return failedRequest(url);
      },
    },
  };

  return { world, terminal, spawned, fetched };
};

module.exports = { createTestWorld };
