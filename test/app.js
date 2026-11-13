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

// The text shown under `node` in opentui's tree of elements, in order: its own when it is a text
// element, then its children's. Hidden elements show nothing.
const textIn = (node) => {
  if (node.visible === false) return [];
  const own = typeof node.plainText === 'string' && node.plainText !== '' ? [node.plainText] : [];
  return [...own, ...node.getChildren().flatMap(textIn)];
};

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

  // Renders until `check(frame)` holds (it may be async), so the app keeps running as it would on screen; throws
  // with the last frame and the log after a few seconds.
  const until = async (check, what) => {
    const deadline = Date.now() + WAIT_MS;
    for (;;) {
      const current = await frame();
      if (await check(current)) return current;
      if (Date.now() > deadline) throw new Error(`${what}:\n${current}\nlog:\n${logs.join('\n')}`);
      await sleep(POLL_MS);
    }
  };

  const app = {
    telegram,
    spawned,
    fetched,
    logs,
    sandbox: context,
    frame,

    waitForFrame: (predicate) => until(predicate, 'frame never matched'),
    waitForText: (text) => until((current) => current.includes(text), `frame never showed ${JSON.stringify(text)}`),
    // For what the frame doesn't show, such as the fake Telegram's state or `app.focused()`.
    waitFor: async (condition) => {
      await until(() => condition(), 'condition never held');
    },

    // Selections, read from opentui's tree of elements (docs/TESTING.md, "Reading the selection").
    // The text in the focused element; in a chat, the selected message as written.
    focused: async () => {
      await terminal.setup.renderOnce();
      const element = terminal.setup.renderer.currentFocusedRenderable;
      return element === null ? null : textIn(element).join('\n');
    },
    // Until the focused element shows `text`: in a chat, until that message is the selected one.
    waitForFocused: (text) =>
      until(
        async () => {
          const focused = await app.focused();
          return focused === text;
        },
        `focus never reached ${JSON.stringify(text)}`,
      ),
    // Opens the first chat in the chat list with Enter, once the list has one, and waits until
    // `selected` is the selected message: the chat itself is open, not just its preview on screen.
    // Which message that is depends on the chat: its first unread one, or else its newest.
    openFirstChat: async ({ selected }) => {
      await until(async () => {
        const row = await app.selectedChat();
        return row !== null;
      }, 'the chat list never showed a chat');
      app.press('RETURN');
      await app.waitForFocused(selected);
    },
    // The selected chat's row in the chat list, its first line as shown: emoji, name, unread count.
    selectedChat: async () => {
      await terminal.setup.renderOnce();
      const list = terminal.setup.renderer.root.findDescendantById('dialogsList');
      if (list === undefined) throw new Error('no chat list: the app no longer has an element with id "dialogsList"');
      return list.getSelectedOption()?.name ?? null;
    },

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
