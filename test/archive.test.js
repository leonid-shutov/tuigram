'use strict';

const assert = require('node:assert');
const { describe, it, afterEach } = require('node:test');
const { createTelegram } = require('./telegram.js');
const { boot } = require('./app.js');

describe('archived chats', () => {
  let telegram;
  let app;

  afterEach(async () => {
    await app?.stop();
    assert.deepStrictEqual(telegram.unanswered, []);
  });

  // The account as it is when the app starts: Ann's chat in the main list, Bob's in the archive.
  // The archive pages land after the main list, so a test waits for the folder to appear.
  const bootWithArchive = async (config = null) => {
    telegram = await createTelegram();
    const ann = await telegram.user({ firstName: 'Ann' });
    const bob = await telegram.user({ firstName: 'Bob' });
    telegram.message(ann, 'hey!');
    telegram.message(bob, 'old thread');
    telegram.archive(bob);
    app = await boot({ telegram, config });
    await app.waitForText('hey!');
    await app.waitFor(() =>
      app.sandbox.store.folders.list.some((folder) => folder.id === app.sandbox.Folder.ARCHIVE.id),
    );
  };

  it('keeps archived chats out of "All chats" and gives them a folder of their own', async () => {
    await bootWithArchive();

    const all = await app.frame();
    assert.doesNotMatch(all, /\bBob\b/);
    assert.doesNotMatch(all, /Archived chats/);

    app.press('l');
    const archive = await app.waitForText('old thread');
    assert.match(archive, /Archived chats/);
    assert.match(archive, /\bBob\b/);
  });

  it('finds an archived chat with the chat search and follows it into the archive', async () => {
    await bootWithArchive();

    app.press('/');
    await app.type('bob');
    app.press('RETURN');

    const frame = await app.waitForText('old thread');
    assert.match(frame, /Archived chats/);
  });

  it('binds and hints the folder keys when the archive is the only folder', async () => {
    await bootWithArchive();

    const hints = (await app.frame()).trimEnd().split('\n').at(-1);
    assert.match(hints, /\bf Folders\b/);
  });

  it('names "All chats" and the archive in the interface language', async () => {
    await bootWithArchive({ language: 'ru' });

    assert.match(await app.frame(), /Все чаты/);
    app.press('l');
    await app.waitForText('Архив');
  });

  it('follows a chat found from a folder that leaves it out into "All chats"', async () => {
    telegram = await createTelegram();
    const ann = await telegram.user({ firstName: 'Ann' });
    const carol = await telegram.user({ firstName: 'Carol' });
    telegram.message(ann, 'hey!');
    telegram.message(carol, 'lunch?');
    telegram.folder('Work', [ann]);
    app = await boot({ telegram });
    await app.waitForText('hey!');
    app.press('l');
    await app.waitForText('Work');

    app.press('/');
    await app.type('carol');
    app.press('RETURN');

    const frame = await app.waitForText('lunch?');
    assert.match(frame, /All chats/);
    assert.doesNotMatch(frame, /Work/);
  });
});
