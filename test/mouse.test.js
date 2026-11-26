'use strict';

const assert = require('node:assert');
const { describe, it, afterEach } = require('node:test');
const { createTelegram } = require('./telegram.js');
const { boot } = require('./app.js');

describe('mouse', () => {
  let telegram;
  let app;

  afterEach(async () => {
    await app?.stop();
    assert.deepStrictEqual(telegram.unanswered, []);
  });

  // Ann's chat is the newest; Bob's is below it, with a message of its own.
  const bootWithChats = async () => {
    telegram = await createTelegram();
    const ann = await telegram.user({ firstName: 'Ann' });
    const bob = await telegram.user({ firstName: 'Bob' });
    const cat = await telegram.user({ firstName: 'Cat' });
    telegram.message(cat, 'got the tickets');
    telegram.message(bob, 'lunch tomorrow?');
    telegram.message(ann, 'hey!');
    telegram.message(ann, 'see you at 5');
    app = await boot({ telegram });
    await app.waitForText('lunch tomorrow?');
  };

  // One folder of the account's non-contacts: every chat here is one, so the list still has rows.
  const bootWithFolder = async () => {
    telegram = await createTelegram();
    const ann = await telegram.user({ firstName: 'Ann' });
    telegram.message(ann, 'hey!');
    telegram.folder({ title: 'Friends', nonContacts: true });
    app = await boot({ telegram });
    await app.waitForText('All chats');
  };

  it('opens the chat whose row is clicked', async () => {
    await bootWithChats();

    const lines = (await app.frame()).split('\n');
    const row = lines.findIndex((line) => line.includes('Bob'));
    assert.ok(row > 0, 'Bob is not in the chat list');
    await app.click(lines[row].indexOf('Bob'), row);

    await app.waitForFocused('lunch tomorrow?');
  });

  it('opens the folder picker when the folder name is clicked', async () => {
    await bootWithFolder();

    const first = (await app.frame()).split('\n')[0];
    const column = first.indexOf('All chats');
    assert.ok(column > 0, first);
    await app.click(column, 0);

    await app.waitForText('Search folders…');
  });

  it('switches to the folder clicked in the picker', async () => {
    await bootWithFolder();

    app.press('f');
    const frame = await app.waitForText('Search folders…');
    const lines = frame.split('\n');
    const query = lines.findIndex((line) => line.includes('Search folders…'));
    const row = lines.findIndex((line, index) => index > query && line.includes('Friends'));
    assert.ok(row > query, 'the folder is not in the picker');
    await app.click(lines[row].indexOf('Friends'), row);

    const after = await app.waitForFrame((current) => !current.includes('Search folders…'));
    assert.match(after.split('\n')[0], /Friends/);
  });
});
