'use strict';

// A fake Telegram, installed as a `--require` preload before bin/tuigram.js boots.
//
// uncommonjs builds its `npm` global with a plain `require()` (see lib/deps.js), and both
// mtcute packages resolve to CommonJS, so seeding `require.cache` here swaps the data source
// for the whole application at one point. Everything else — the entry point, the renderer, the
// auth layer, the messenger façade, the stores, the UI — is the real thing, unmodified.
//
// Only the calls tuigram actually makes are implemented; see src/3-auth/ and
// src/4-messenger/(methods)/ for the complete list.

const Module = require('node:module');
const fixtures = require('./fixtures.js');

const stub = (name, exports) => {
  const id = require.resolve(name);
  const module_ = new Module(id, null);
  module_.filename = id;
  module_.loaded = true;
  module_.exports = exports;
  require.cache[id] = module_;
};

class TelegramClient {
  // Resolving immediately is what skips sign-in: src/3-auth/5-signIn.js awaits this, so the
  // three-pane UI comes up instead of the QR screen.
  async start() {}

  async destroy() {}

  async logOut() {
    return true;
  }

  async *iterDialogs({ archived = 'exclude' } = {}) {
    if (archived === 'only') return;
    for (const dialog of fixtures.dialogs) yield dialog;
  }

  // A plain array with no `next`, so src/4-messenger/(methods)/getHistory.js stops after one
  // page and the endless-upward-paging path settles.
  async getHistory(chatId) {
    return fixtures.historyOf(chatId);
  }

  async getPeerDialogs([chatId]) {
    return [{ lastReadOutgoing: fixtures.lastReadOutgoing(chatId) }];
  }

  async readHistory() {}

  async sendText(chatId, text) {
    return fixtures.sent(chatId, text);
  }

  async downloadAsBuffer(fileId) {
    return fileId === fixtures.THUMB_320_ID ? fixtures.THUMB_320 : null;
  }
}

// The two thumbnail kinds src/4-messenger/(common)/Media/from.js asks for, by their real names.
const Thumbnail = { THUMB_STRIP: 'i', THUMB_320x320_BOX: 'm' };

// Nothing arrives in a demo, so the handlers are simply never called.
const Dispatcher = { for: () => ({ onNewMessage() {}, onHistoryRead() {} }) };

stub('@mtcute/node', { TelegramClient, Thumbnail });
stub('@mtcute/dispatcher', { Dispatcher });
