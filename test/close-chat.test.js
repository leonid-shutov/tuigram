'use strict';

const assert = require('node:assert');
const { describe, it, beforeEach, afterEach } = require('node:test');
const { createTelegram } = require('./telegram.js');
const { boot } = require('./app.js');

const NOTIFIER = { darwin: 'osascript', win32: 'powershell' }[process.platform] ?? 'notify-send';

const openChat = (frame) => frame.split('\n')[0].match(/ 2 · \S+ (\w+)/)?.[1] ?? null;
const hintBar = (frame) => frame.trimEnd().split('\n').at(-1);

describe('closing a chat', () => {
  let telegram;
  let ann;
  let bob;
  let app;

  const closed = () => app.waitForFrame((frame) => frame.includes('No chat open') && openChat(frame) === null);

  beforeEach(async () => {
    telegram = await createTelegram();
    ann = await telegram.user({ firstName: 'Ann' });
    bob = await telegram.user({ firstName: 'Bob' });
    telegram.message(bob, 'lunch tomorrow?');
    telegram.read(bob);
    telegram.message(ann, 'hey!');
    telegram.read(ann);
    app = await boot({ telegram, width: 120 });
    await app.openFirstChat({ selected: 'hey!' });
  });

  afterEach(async () => {
    await app?.stop();
    assert.deepStrictEqual(telegram.unanswered, []);
  });

  it('closes with Esc in the messages, back to the chat list on the same chat', async () => {
    app.press('ESCAPE');
    await closed();

    assert.match(await app.selectedChat(), /Ann/);
    app.press('RETURN');
    await app.waitForFocused('hey!');
    assert.strictEqual(openChat(await app.frame()), 'Ann');
  });

  it('closes with Esc in the chat list', async () => {
    app.press('1');
    app.press('ESCAPE');
    await closed();
  });

  it('reads nothing that arrives once closed, and notifies about it', async () => {
    app.press('ESCAPE');
    await closed();

    telegram.receive(ann, 'still there?');
    await app.waitForText('still there?');

    await app.waitFor(() => app.spawned.length === 1);
    assert.strictEqual(app.spawned[0].cmd, NOTIFIER);
    assert.strictEqual(telegram.unreadCount(ann), 1);
  });

  it('keeps unsent text with its own chat', async () => {
    app.press('3');
    await app.type('half a thought');
    // Waited out in between: two escapes sent back to back read as one alt+escape.
    app.press('ESCAPE');
    await app.waitForFocused('hey!');
    app.press('ESCAPE');
    await closed();
    assert.ok(!(await app.frame()).includes('half a thought'));

    app.press('j');
    app.press('RETURN');
    await app.waitForFocused('lunch tomorrow?');
    assert.ok(!(await app.frame()).includes('half a thought'));

    app.press('1');
    app.press('k');
    app.press('RETURN');
    await app.waitForFocused('hey!');
    await app.waitForText('half a thought');
  });

  it('drops a reply in progress', async () => {
    app.press('r');
    app.press('2', { meta: true }); // to the messages, the reply still set
    app.press('ESCAPE');
    await closed();

    app.press('RETURN');
    await app.waitForFocused('hey!');
    app.press('3');
    await app.type('on my way');
    app.press('RETURN');

    await app.waitFor(() => telegram.history(ann).at(-1)?.text === 'on my way');
    assert.strictEqual(telegram.history(ann).at(-1).replyTo, null);
  });

  it('keeps what is typed with no chat open, and sends it nowhere', async () => {
    app.press('ESCAPE');
    await closed();

    app.press('3');
    await app.type('a note');
    app.press('RETURN');

    await app.waitForText('a note');
    assert.strictEqual(telegram.history(ann).at(-1).text, 'hey!');
    assert.strictEqual(telegram.history(bob).at(-1).text, 'lunch tomorrow?');
  });

  it('offers Esc on the hint bar only while a chat is open', async () => {
    app.press('1');
    await app.waitForFrame((frame) => hintBar(frame).includes('esc Close'));

    app.press('ESCAPE');
    await closed();
    assert.ok(!hintBar(await app.frame()).includes('esc Close'));
  });
});
