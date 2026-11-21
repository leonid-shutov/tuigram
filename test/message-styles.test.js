'use strict';

const assert = require('node:assert');
const { describe, it, beforeEach, afterEach } = require('node:test');
const { createTelegram } = require('./telegram.js');
const { boot } = require('./app.js');

const WIDTH = 100;

// The chat section's rows, inside its border and with their trailing spaces trimmed. The chat list
// ends in a border right where the chat section starts, so they start after the first `││`.
const chatRows = (frame) =>
  frame
    .split('\n')
    .filter((line) => line.includes('││'))
    .map((line) => line.slice(line.indexOf('││') + 2, -1).trimEnd());

// The chat section's row showing `text`.
const chatRow = (frame, text) => {
  const row = chatRows(frame).find((line) => line.includes(text));
  assert.ok(row !== undefined, `no row shows ${JSON.stringify(text)}:\n${frame}`);
  return row;
};

const LONG = Array.from({ length: 40 }, (_, i) => `line ${i + 1} of a long message`).join('\n');

describe('message styles', () => {
  let telegram;
  let ann;
  let app;

  // Two of Ann's, two of ours, one of Ann's: three runs. Ann never read ours, but they aren't the
  // chat's end, so there is no outbox-unread run.
  beforeEach(async () => {
    telegram = await createTelegram();
    ann = await telegram.user({ firstName: 'Ann' });
    telegram.message(ann, 'hey, anyone around tonight?');
    telegram.message(ann, 'after 8, what is the plan?');
    telegram.message(ann, 'ramen on 5th', { out: true });
    telegram.message(ann, 'booked for 4', { out: true });
    telegram.message(ann, 'count me in!');
    telegram.read(ann);
  });

  afterEach(async () => {
    await app?.stop();
    assert.deepStrictEqual(telegram.unanswered, []);
  });

  // Like `app.openFirstChat`, for styles whose selected post holds more than its text (a header).
  const openChat = async (last) => {
    await app.waitFor(async () => {
      const chat = await app.selectedChat();
      return chat !== null;
    });
    app.press('RETURN');
    await app.waitFor(async () => {
      const focused = await app.focused();
      return focused?.endsWith(last) ?? false;
    });
    return app.frame();
  };

  it('draws a bubble around each message by default', async () => {
    app = await boot({ telegram, width: WIDTH });
    await app.openFirstChat({ selected: 'count me in!' });
    const frame = await app.frame();

    assert.strictEqual(chatRow(frame, 'count me in!'), ' │ count me in! │');
    assert.match(chatRow(frame, 'booked for 4'), /^ +│ booked for 4 │$/);
  });

  it('draws a bar down the left edge of each message, ours still on the right', async () => {
    app = await boot({ telegram, width: WIDTH, config: { messageStyle: 'bar' } });
    await app.openFirstChat({ selected: 'count me in!' });
    const frame = await app.frame();

    assert.strictEqual(chatRow(frame, 'count me in!'), ' │ count me in!');
    assert.match(chatRow(frame, 'booked for 4'), /^ {20,}│ booked for 4$/);
    // A run's bars join into one: no row between Ann's two messages.
    const rows = chatRows(frame);
    const first = rows.findIndex((row) => row.includes('hey, anyone'));
    assert.ok(rows[first + 1].includes('after 8'), frame);
  });

  it('draws the bar on the outer edge with bar-mirrored', async () => {
    app = await boot({ telegram, width: WIDTH, config: { messageStyle: 'bar-mirrored' } });
    await app.openFirstChat({ selected: 'count me in!' });
    const frame = await app.frame();

    assert.strictEqual(chatRow(frame, 'count me in!'), ' │ count me in!');
    assert.match(chatRow(frame, 'booked for 4'), /^ {20,}booked for 4 │$/);
  });

  it('puts every message on the left under its sender, once a run, with thread', async () => {
    app = await boot({ telegram, width: WIDTH, config: { messageStyle: 'thread' } });
    const frame = await openChat('count me in!');

    // A header names the sender, then the time: one per run, not per message.
    const headers = chatRows(frame)
      .map((row) => row.match(/^ {4}[▎ ] (Ann|You) {2}\S/)?.[1])
      .filter((name) => name !== undefined);
    assert.deepStrictEqual(headers, ['Ann', 'You', 'Ann'], frame);
    // Only the selected post shows its edge.
    assert.strictEqual(chatRow(frame, 'count me in!'), '    ▎ count me in!');
    assert.strictEqual(chatRow(frame, 'booked for 4'), '      booked for 4');
    assert.match(await app.focused(), /^Ann {2}\S.*\ncount me in!$/);
  });

  it('logs each message on a line of its own, after its time and sender, with irc', async () => {
    app = await boot({ telegram, width: WIDTH, config: { messageStyle: 'irc' } });
    const frame = await openChat('count me in!');

    assert.match(chatRow(frame, 'hey, anyone'), /^ {4}\S.* Ann │ hey, anyone around tonight\?$/);
    assert.match(chatRow(frame, 'booked for 4'), /^ {4}\S.* You │ booked for 4$/);
    // No gaps: one message per row, the rule unbroken.
    const rows = chatRows(frame);
    const first = rows.findIndex((row) => row.includes('hey, anyone'));
    assert.deepStrictEqual(
      rows.slice(first, first + 5).map((row) => row.match(/│ (\S.*)$/)?.[1]),
      ['hey, anyone around tonight?', 'after 8, what is the plan?', 'ramen on 5th', 'booked for 4', 'count me in!'],
    );
  });

  it('keeps the bar beside an outbox-unread run in a left gutter', async () => {
    telegram.message(ann, 'see you there', { out: true });
    app = await boot({ telegram, width: WIDTH, config: { messageStyle: 'irc' } });
    const frame = await openChat('see you there');

    assert.match(chatRow(frame, 'see you there'), /^ {2}✓ \S.* You │ see you there$/);
    assert.match(chatRow(frame, 'count me in!'), /^ {4}\S.* Ann │ count me in!$/);
  });

  it('scrolls a message taller than the chat inside its frame, and says how', async () => {
    telegram.message(ann, LONG);
    telegram.read(ann);
    app = await boot({ telegram, width: WIDTH, config: { messageStyle: 'irc' } });
    await openChat('line 40 of a long message');

    assert.ok((await app.frame()).includes('shift+↓/↑ scroll'));
    assert.ok((await app.frame()).includes('│ line 1 of a long message'));
    for (let i = 0; i < 5; i++) app.press('j', { shift: true });
    const frame = await app.waitForText('│ line 6 of a long message');
    assert.ok(!frame.includes('line 5 of a long message'), frame);
  });
});
