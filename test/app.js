'use strict';

const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { setTimeout: sleep } = require('node:timers/promises');
const { format } = require('node:util');
const { loadTree } = require('@leonid-shutov/uncommonjs');
const { createContext } = require('../bin/context.js');
const { createTestWorld } = require('./world.js');

const ROOT = path.resolve(__dirname, '..');
const WAIT_MS = 3000;
const POLL_MS = 10;

/** An object that inherits from `proto`, with `props` as its own read-only properties. */
const inherit = (proto, props) =>
  Object.create(proto, Object.fromEntries(Object.entries(props).map(([key, value]) => [key, { value }])));

/** The whole app in a test world (docs/TESTING.md). */
const boot = async ({ telegram, width = 80, height = 24, env = {} }) => {
  const home = await fsp.mkdtemp(path.join(os.tmpdir(), 'tuigram-test-'));
  const removeHome = () => fsp.rm(home, { recursive: true, force: true });
  const { world, terminal, spawned, fetched } = await createTestWorld({ telegram, width, height });

  const logs = [];
  const log = (...args) => void logs.push(format(...args));
  const console = { log, error: log, warn: log, info: log, debug: log };

  const { promise: exited, resolve: exit } = Promise.withResolvers();
  // Not Object.assign: `process.stderr` is a getter with no setter, and assigning it throws.
  const testProcess = inherit(process, {
    env: {
      XDG_CONFIG_HOME: path.join(home, 'config'),
      XDG_DATA_HOME: path.join(home, 'data'),
      XDG_STATE_HOME: path.join(home, 'state'),
      XDG_CACHE_HOME: path.join(home, 'cache'),
      TERM: 'xterm-256color',
      TUIGRAM_API_ID: '1',
      TUIGRAM_API_HASH: 'test',
      ...env,
    },
    argv: [process.execPath, path.join(ROOT, 'bin', 'tuigram.js')],
    exit: (code = 0) => exit(code),
    on: () => testProcess,
    removeAllListeners: () => testProcess,
    stderr: { write: (chunk) => void logs.push(String(chunk)) },
  });
  const crashReport = (label, detail) => log(`crash: ${label}\n${detail}`);

  const context = await createContext({ world, console, process: testProcess, crashReport });
  try {
    const started = loadTree(context, { rootDir: ROOT }).then(() => null);
    const code = await Promise.race([started, exited]);
    if (code !== null) throw new Error(`tuigram exited with ${code} while starting:\n${logs.join('\n')}`);
  } catch (error) {
    await removeHome();
    throw error;
  }

  const frame = async () => {
    await terminal.setup.renderOnce();
    return terminal.setup.captureCharFrame();
  };

  const app = {
    telegram,
    spawned,
    fetched,
    logs,
    sandbox: context,
    frame,

    waitForFrame: async (predicate) => {
      const deadline = Date.now() + WAIT_MS;
      for (;;) {
        const current = await frame();
        if (predicate(current)) return current;
        if (Date.now() > deadline) throw new Error(`frame never matched:\n${current}\nlog:\n${logs.join('\n')}`);
        await sleep(POLL_MS);
      }
    },

    waitForText: (text) => app.waitForFrame((current) => current.includes(text)),

    press: (key, modifiers) => terminal.setup.mockInput.pressKey(key, modifiers),
    type: (text) => terminal.setup.mockInput.typeText(text),

    stop: async () => {
      context.Crash.exit(null, 0);
      const exitCode = await exited;
      await removeHome();
      return exitCode;
    },
  };
  return app;
};

module.exports = { boot };
