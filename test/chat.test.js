'use strict';

const assert = require('node:assert');
const { describe, it, beforeEach, afterEach } = require('node:test');
const { setTimeout: sleep } = require('node:timers/promises');
const { createTelegram } = require('./telegram.js');
const { boot } = require('./app.js');

describe('chat', () => {
  let telegram;
  let ann;
  let app;

  afterEach(async () => {
    // `app` is unset when `boot` threw: stopping it would hide that error behind a TypeError.
    await app?.stop();
    assert.deepStrictEqual(telegram.unanswered, []);
  });

  describe('with unread messages', () => {
    beforeEach(async () => {
      telegram = await createTelegram();
      ann = await telegram.user({ firstName: 'Ann' });
      telegram.message(ann, 'from last week');
      telegram.read(ann);
      telegram.message(ann, 'hey!');
      telegram.message(ann, 'see you at 5');
      app = await boot({ telegram });
      await app.openFirstChat({ selected: 'hey!' });
    });

    it('shows its history, read and unread', async () => {
      const frame = await app.waitForText('see you at 5');

      assert.ok(frame.includes('from last week'));
      assert.ok(frame.includes('hey!'));
    });

    it('opens at the first unread message, under a divider counting them', async () => {
      await app.waitForText('2 new');

      assert.strictEqual(await app.focused(), 'hey!');
    });

    it('marks the chat read, in the chat list and on Telegram', async () => {
      await app.waitFor(() => telegram.unreadCount(ann) === 0);

      assert.doesNotMatch(await app.frame(), /Ann +\d+ │/);
    });
  });

  describe('longer than a page, read to the end', () => {
    beforeEach(async () => {
      telegram = await createTelegram();
      ann = await telegram.user({ firstName: 'Ann' });
      for (let i = 1; i <= 100; i++) telegram.message(ann, `message ${i}`);
      telegram.read(ann);
      app = await boot({ telegram });
      await app.openFirstChat({ selected: 'message 100' });
    });

    it('opens at the newest message', async () => {
      assert.strictEqual(await app.focused(), 'message 100');
    });

    it('moves to older and newer messages with k and j', async () => {
      app.press('k');
      app.press('k');
      app.press('j');

      assert.strictEqual(await app.focused(), 'message 99');
    });

    it('loads older messages with gg, page by page, back to the first one', async () => {
      let current = null;
      for (let presses = 0; presses < 100 && current !== 'message 1'; presses++) {
        app.press('g');
        app.press('g');
        current = await app.focused();
        await sleep(10);
      }

      assert.strictEqual(current, 'message 1');
    });

    it('jumps back to the newest message with G', async () => {
      app.press('k');
      app.press('k');
      app.press('k');
      assert.strictEqual(await app.focused(), 'message 97');

      app.press('G');

      assert.strictEqual(await app.focused(), 'message 100');
    });
  });

  describe('with the chat with Ann open', () => {
    let bob;

    beforeEach(async () => {
      telegram = await createTelegram();
      ann = await telegram.user({ firstName: 'Ann' });
      bob = await telegram.user({ firstName: 'Bob' });
      telegram.message(bob, 'lunch tomorrow?');
      telegram.message(ann, 'hey!');
      telegram.message(ann, 'see you at 5');
      app = await boot({ telegram });
      await app.openFirstChat({ selected: 'hey!' });
    });

    it('shows a message arriving in it, without a notification', async () => {
      telegram.receive(ann, 'running late');
      await app.waitForText('running late');

      assert.deepStrictEqual(app.spawned, []);
    });

    it('notifies about a message arriving in another chat', async () => {
      telegram.receive(bob, 'still on?');
      await app.waitForText('still on?');

      assert.deepStrictEqual(app.spawned, [{ cmd: 'notify-send', args: ['--app-name=tuigram', 'Bob', 'still on?'] }]);
    });
  });
});
