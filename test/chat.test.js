'use strict';

const assert = require('node:assert');
const { describe, it, beforeEach, afterEach } = require('node:test');
const { createTelegram } = require('./telegram.js');
const { boot } = require('./app.js');

describe('chats', () => {
  let telegram;
  let ann;
  let bob;
  let app;

  beforeEach(async () => {
    telegram = await createTelegram();
    ann = await telegram.user({ firstName: 'Ann' });
    bob = await telegram.user({ firstName: 'Bob' });
    telegram.message(bob, 'lunch tomorrow?');
    telegram.message(ann, 'hey!');
    telegram.message(ann, 'see you at 5');
    app = await boot({ telegram });
  });

  afterEach(async () => {
    // `app` is unset when `boot` threw: stopping it would hide that error behind a TypeError.
    await app?.stop();
    assert.deepStrictEqual(telegram.unanswered, []);
  });

  it('lists every chat, the most recent first, with its last message', async () => {
    const frame = await app.waitForText('Bob');

    assert.ok(frame.includes('see you at 5'));
    assert.ok(frame.includes('lunch tomorrow?'));
    assert.ok(frame.indexOf('Ann') < frame.indexOf('Bob'), frame);
  });

  it('opens the selected chat with Enter and shows its history', async () => {
    await app.waitForText('Ann');

    app.press('RETURN');
    const frame = await app.waitForText('hey!');

    assert.ok(frame.includes('see you at 5'));
  });

  describe('with the chat with Ann open', () => {
    beforeEach(async () => {
      await app.waitForText('Ann');
      app.press('RETURN');
      await app.waitForText('hey!');
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
