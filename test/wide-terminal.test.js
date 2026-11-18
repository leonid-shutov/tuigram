'use strict';

const assert = require('node:assert');
const { describe, it, beforeEach, afterEach } = require('node:test');
const { createTelegram } = require('./telegram.js');
const { boot } = require('./app.js');

const WIDTH = 240;
const HEIGHT = 70;
const LONG =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore ' +
  'et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut ' +
  'aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.';

// The text lines of a bubble, as drawn: what sits between its border and its padding.
const bubbleLines = (frame) =>
  frame
    .split('\n')
    .map((line) => line.match(/│ ([A-Za-z][^│]*?) *│/)?.[1])
    .filter((text) => text !== undefined && LONG.includes(text));

describe('on a wide terminal', () => {
  let telegram;
  let app;

  beforeEach(async () => {
    telegram = await createTelegram();
    const ann = await telegram.user({ firstName: 'Ann' });
    telegram.message(ann, LONG);
    telegram.message(ann, 'ok');
    telegram.read(ann);
    app = await boot({ telegram, width: WIDTH, height: HEIGHT });
    await app.openFirstChat({ selected: 'ok' });
  });

  afterEach(async () => {
    await app?.stop();
    assert.deepStrictEqual(telegram.unanswered, []);
  });

  it('fills the whole terminal', async () => {
    const rows = (await app.waitForText('Lorem')).split('\n');

    // The panes' bottom border reaches the last column, and the hint bar sits on the last row.
    assert.strictEqual(rows[HEIGHT - 2].trimEnd().length, WIDTH, rows[HEIGHT - 2]);
    assert.notStrictEqual(rows[HEIGHT - 1].trim(), '');
  });

  it('wraps a long message at a readable width, not the chat section', async () => {
    const lines = bubbleLines(await app.waitForText('Lorem'));

    assert.ok(lines.length >= 3, lines.join('\n'));
    assert.ok(Math.max(...lines.map((line) => line.length)) <= 96, lines.join('\n'));
  });
});
