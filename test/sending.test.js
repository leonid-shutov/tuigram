'use strict';

const assert = require('node:assert');
const { describe, it, beforeEach, afterEach } = require('node:test');
const { createTelegram } = require('./telegram.js');
const { boot } = require('./app.js');

describe('sending', () => {
  let telegram;
  let ann;
  let app;

  const sentToAnn = async (text) => {
    await app.waitFor(() => telegram.history(ann).at(-1)?.text === text);
    return telegram.history(ann).at(-1);
  };

  beforeEach(async () => {
    telegram = await createTelegram();
    ann = await telegram.user({ firstName: 'Ann' });
    telegram.message(ann, 'hey!');
    telegram.message(ann, 'see you at 5');
    telegram.read(ann);
    app = await boot({ telegram });
    await app.openFirstChat({ selected: 'see you at 5' });
  });

  afterEach(async () => {
    // `app` is unset when `boot` threw: stopping it would hide that error behind a TypeError.
    await app?.stop();
    assert.deepStrictEqual(telegram.unanswered, []);
  });

  it('sends what is typed in the message box with Enter, and empties the box', async () => {
    app.press('3');
    await app.type('on my way');
    app.press('RETURN');

    assert.deepStrictEqual(await sentToAnn('on my way'), {
      text: 'on my way',
      out: true,
      replyTo: null,
      forwardedFrom: null,
    });
    const frame = await app.waitForText('on my way');
    assert.ok(frame.includes('Type a message...'), frame);
  });

  it('replies to the selected message', async () => {
    app.press('k');
    app.press('r');
    await app.type('on my way');
    app.press('RETURN');

    assert.deepStrictEqual(await sentToAnn('on my way'), {
      text: 'on my way',
      out: true,
      replyTo: 'hey!',
      forwardedFrom: null,
    });
    app.press('2', { meta: true });
    const sent = await app.focused();
    assert.ok(sent.includes('hey!'), sent);
    assert.ok(sent.includes('on my way'), sent);
  });
});
