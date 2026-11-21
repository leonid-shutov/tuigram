'use strict';

const assert = require('node:assert');
const { describe, it, afterEach } = require('node:test');
const { createTelegram } = require('./telegram.js');
const { boot } = require('./app.js');

describe('interface language', () => {
  let app;

  afterEach(async () => {
    await app?.stop();
  });

  // Ann's unread messages, opened at the first: the divider above them counts them in the
  // language's plural form for the count, which the Slavic languages split three ways (1, 2–4, 5–20).
  const openUnread = async (language, count) => {
    const telegram = await createTelegram();
    const ann = await telegram.user({ firstName: 'Ann' });
    telegram.message(ann, 'from last week');
    telegram.read(ann);
    for (let i = 1; i <= count; i++) telegram.message(ann, `unread ${i}`);
    app = await boot({ telegram, config: { language } });
    await app.openFirstChat({ selected: 'unread 1' });
    return app;
  };

  const cases = [
    ['en', 1, '─ 1 new ─'],
    ['ms', 2, '─ 2 baharu ─'],
    ['ru', 1, '─ 1 новое ─'],
    ['ru', 3, '─ 3 новых ─'],
    ['uk', 3, '─ 3 нові ─'],
    ['uk', 5, '─ 5 нових ─'],
    ['be', 2, '─ 2 новыя ─'],
    ['be', 21, '─ 21 новае ─'],
    ['pl', 22, '─ 22 nowe ─'],
    ['pl', 5, '─ 5 nowych ─'],
    ['cs', 3, '─ 3 nové ─'],
    ['cs', 5, '─ 5 nových ─'],
    ['de', 2, '─ 2 neue ─'],
    ['es', 1, '─ 1 nuevo ─'],
    ['pt', 2, '─ 2 novas ─'],
    ['it', 2, '─ 2 nuovi ─'],
    ['fr', 1, '─ 1 nouveau ─'],
    ['tr', 4, '─ 4 yeni ─'],
    ['uz', 2, '─ 2 ta yangi ─'],
    ['kk', 3, '─ 3 жаңа ─'],
    ['id', 2, '─ 2 baru ─'],
  ];
  for (const [language, count, shown] of cases) {
    it(`counts ${count} unread as "${shown}" in ${language}`, async () => {
      const opened = await openUnread(language, count);

      await opened.waitForText(shown);
    });
  }

  // Below the divider, the bottom border counts the ones after the selected message.
  it('counts the unread left below in the language', async () => {
    await openUnread('ru', 3);

    await app.waitForText('↓ 2 новых');
  });

  it('words the key hints in the language', async () => {
    await openUnread('ru', 1);

    const frame = await app.waitForText('space Действия');
    assert.ok(!frame.includes('Actions'), frame);
  });
});
