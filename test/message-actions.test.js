'use strict';

const assert = require('node:assert');
const { describe, it, beforeEach, afterEach } = require('node:test');
const { createTelegram } = require('./telegram.js');
const { boot } = require('./app.js');

describe('message actions', () => {
  let telegram;
  let ann;
  let app;

  afterEach(async () => {
    // `app` is unset when `boot` threw: stopping it would hide that error behind a TypeError.
    await app?.stop();
    assert.deepStrictEqual(telegram.unanswered, []);
  });

  describe('editing', () => {
    beforeEach(async () => {
      telegram = await createTelegram();
      ann = await telegram.user({ firstName: 'Ann' });
      telegram.message(ann, 'hey!');
      telegram.message(ann, 'see you at 6', { out: true });
      telegram.read(ann);
      app = await boot({ telegram });
      await app.openFirstChat({ selected: 'see you at 6' });
    });

    it('edits the selected message with e, on screen and on Telegram', async () => {
      app.press('e');
      await app.waitForText('Editing');
      app.press('BACKSPACE');
      await app.type('5');
      app.press('RETURN');

      await app.waitFor(() => telegram.history(ann).at(-1).text === 'see you at 5');
      await app.waitForFrame((frame) => frame.includes('see you at 5') && !frame.includes('see you at 6'));
    });

    it('leaves a message from someone else as it is', async () => {
      app.press('k');
      app.press('e');

      assert.strictEqual(await app.focused(), 'hey!');
      assert.ok((await app.frame()).includes('Type a message...'));
    });
  });

  describe('deleting', () => {
    beforeEach(async () => {
      telegram = await createTelegram();
      ann = await telegram.user({ firstName: 'Ann' });
      telegram.message(ann, 'hey!');
      telegram.message(ann, 'see you at 5');
      telegram.read(ann);
      app = await boot({ telegram });
      await app.openFirstChat({ selected: 'see you at 5' });
      app.press('k');
      app.press('d');
      await app.waitForText('Delete for me and Ann');
    });

    const deleted = async () => {
      await app.waitFor(() => telegram.deleted(ann).length > 0);
      return telegram.deleted(ann);
    };

    it('asks whether to delete it for Ann too, or just for you', async () => {
      assert.ok((await app.frame()).includes('Delete for me'));
    });

    it('deletes it for both sides', async () => {
      app.press('RETURN');

      assert.deepStrictEqual(await deleted(), [{ text: 'hey!', forEveryone: true }]);
      await app.waitForFrame((frame) => !frame.includes('hey!'));
    });

    it('deletes it just for you', async () => {
      app.press('j');
      app.press('RETURN');

      assert.deepStrictEqual(await deleted(), [{ text: 'hey!', forEveryone: false }]);
      await app.waitForFrame((frame) => !frame.includes('hey!'));
    });

    it('keeps it when the question is closed with Esc', async () => {
      app.press('ESCAPE');

      const frame = await app.waitForFrame((current) => !current.includes('Delete for me'));
      assert.ok(frame.includes('hey!'), frame);
      assert.deepStrictEqual(telegram.deleted(ann), []);
    });
  });

  describe('forwarding', () => {
    let bob;

    beforeEach(async () => {
      telegram = await createTelegram();
      bob = await telegram.user({ firstName: 'Bob' });
      ann = await telegram.user({ firstName: 'Ann' });
      telegram.message(bob, 'lunch?');
      telegram.message(ann, 'hey!');
      telegram.message(ann, 'see you at 5'); // the newest message: Ann's chat is first in the list
      telegram.read(bob);
      telegram.read(ann);
      app = await boot({ telegram });
      await app.openFirstChat({ selected: 'see you at 5' });
      app.press('k');
      app.press('f');
      await app.waitForText('Forward to…');
    });

    const forwardedToBob = async () => {
      await app.waitFor(() => telegram.history(bob).length > 1);
      return telegram.history(bob).at(-1);
    };

    it('forwards the selected message to the chat picked, and stays in this one', async () => {
      await app.type('bob');
      app.press('RETURN');

      assert.deepStrictEqual(await forwardedToBob(), { text: 'hey!', out: true, replyTo: null, forwardedFrom: 'Ann' });
      await app.waitForText('forwarded to Bob');
      assert.strictEqual(await app.focused(), 'hey!');
    });

    it('shows the forward in the chat it went to, with whose message it was', async () => {
      await app.type('bob');
      app.press('RETURN');
      await forwardedToBob();

      // Bob's chat now has the newest message, so it is first in the list.
      app.press('1', { meta: true });
      app.press('g');
      app.press('g');
      app.press('RETURN');
      await app.waitForFocused('↪ Forwarded from Ann\nhey!');
    });

    it('forwards nothing when the picker is closed with Esc', async () => {
      app.press('ESCAPE');

      await app.waitForFrame((frame) => !frame.includes('Forward to…'));
      assert.strictEqual(telegram.history(bob).length, 1);
    });
  });
});
