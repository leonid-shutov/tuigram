'use strict';

const assert = require('node:assert');
const { describe, it, beforeEach, afterEach } = require('node:test');
const { createTelegram } = require('./telegram.js');
const { boot } = require('./app.js');

const openChat = (frame) => frame.split('\n')[0].match(/ 2 · \S+ (\w+)/)?.[1] ?? null;

describe('chat list', () => {
  let telegram;
  let bob;
  let app;

  beforeEach(async () => {
    telegram = await createTelegram();
    const ann = await telegram.user({ firstName: 'Ann' });
    bob = await telegram.user({ firstName: 'Bob' });
    const cat = await telegram.user({ firstName: 'Cat' });
    telegram.message(cat, 'got the tickets');
    telegram.message(bob, 'lunch tomorrow?');
    telegram.message(ann, 'hey!');
    telegram.message(ann, 'see you at 5');
    app = await boot({ telegram });
    await app.waitForText('Cat');
  });

  afterEach(async () => {
    await app?.stop();
    assert.deepStrictEqual(telegram.unanswered, []);
  });

  it('lists every chat, the most recent first, with its last message', async () => {
    const frame = await app.frame();

    assert.ok(frame.includes('see you at 5'));
    assert.ok(frame.includes('lunch tomorrow?'));
    assert.ok(frame.includes('got the tickets'));
    assert.ok(frame.indexOf('Ann') < frame.indexOf('Bob'), frame);
    assert.ok(frame.indexOf('Bob') < frame.indexOf('Cat'), frame);
  });

  it('shows how many unread messages each chat has', async () => {
    const frame = await app.frame();

    assert.match(frame, /Ann +2 /);
    assert.match(frame, /Bob +1 /);
  });

  it('opens the first chat with Enter', async () => {
    app.press('RETURN');
    const frame = await app.waitForText('hey!');

    assert.strictEqual(openChat(frame), 'Ann');
  });

  it('moves down and up the list with j and k', async () => {
    assert.match(await app.selectedChat(), /\bAnn\b/);

    app.press('j');
    app.press('j');
    app.press('k');

    assert.match(await app.selectedChat(), /\bBob\b/);
  });

  it('jumps to the last chat with G and back to the first with gg', async () => {
    app.press('G');
    assert.match(await app.selectedChat(), /\bCat\b/);

    app.press('g');
    app.press('g');
    assert.match(await app.selectedChat(), /\bAnn\b/);
  });

  it('jumps to a chat by name with /', async () => {
    app.press('/');
    await app.type('bob');
    app.press('RETURN');
    const frame = await app.waitForFrame((current) => openChat(current) !== null);

    assert.strictEqual(openChat(frame), 'Bob');
  });

  it('moves a chat to the top when a message arrives in it', async () => {
    telegram.receive(bob, 'still on?');
    const frame = await app.waitForText('still on?');

    assert.ok(frame.indexOf('Bob') < frame.indexOf('Ann'), frame);
  });
});

describe('chat list, with a symbol in a name', () => {
  let telegram;
  let app;

  beforeEach(async () => {
    telegram = await createTelegram();
    const mom = await telegram.user({ firstName: 'Mom ❤' });
    telegram.message(mom, 'call me');
    telegram.message(mom, 'when you can');
    telegram.message(mom, 'love you');
    app = await boot({ telegram });
    await app.waitForText('Mom');
  });

  afterEach(async () => {
    await app?.stop();
    assert.deepStrictEqual(telegram.unanswered, []);
  });

  // The unread count is repainted in its own colour where the app works out it is, so a name the
  // app measures wider or narrower than the terminal draws it shows the count twice.
  it('shows the unread count once', async () => {
    const row = (await app.frame()).split('\n').find((line) => line.includes('Mom ❤'));

    assert.match(row, /Mom ❤ +3 │/);
  });
});
