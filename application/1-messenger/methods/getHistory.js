//(() =>
//async function* (chatId, pageSize) {
//const cachedMessages = $.cache.chats.get(chatId) ?? [[]];
//yield cachedMessages;

//let offset = cachedMessages.at(-1)?.next ?? undefined;

//while (true) {
//const params = { offset, limit: pageSize };

//// the first message in the array is the most recent message in the chat
//const messages = await messenger.tg.getHistory(chatId, params);

//cachedMessages.push(messages);

//yield messages;

//if (messages.next === undefined) return;
//offset = messages.next;
//}
//})();

((source) =>
  async function* (chatId, chunkSize) {
    let page = [];
    for (const dialog of source) {
      page.push(dialog);
      if (page.length === chunkSize) {
        await node.timers.promises.setTimeout(5000);
        yield page;
        page = [];
      }
    }
    if (page.length > 0) {
      await node.timers.promises.setTimeout(5000);
      yield page;
    }
  })(
  [
    {
      author: { name: 'Госпожа Аня Отбивная' },
      text: 'Ну что,\nты опять ушёл в режим «невидимка»? bla bla bla bla bla bla bla',
    },
    {
      author: { name: 'me' },
      text: 'Немного \nДень просто закрутил.',
    },
    {
      author: { name: 'Госпожа Аня Отбивная' },
      text: 'Понимаю.\nГлавное — ты вернулся.',
    },
    {
      author: { name: 'me' },
      text: 'Вернулся и даже живой.\nЭто уже победа.',
    },
    {
      author: { name: 'Госпожа Аня Отбивная' },
      text: 'Отлично.\nЗначит, можно считать день успешным.',
    },
    {
      author: { name: 'me' },
      text: 'А у тебя как?\nБез катастроф?',
    },
    {
      author: { name: 'Госпожа Аня Отбивная' },
      text: 'Почти.\nРазлила кофе,\nно стол выжил.',
    },
    {
      author: { name: 'me' },
      text: 'Стол — герой.\nКофе пал смертью храбрых.',
    },
    {
      author: { name: 'Госпожа Аня Отбивная' },
      text: 'Именно.\nМинуту молчания.',
    },
    {
      author: { name: 'me' },
      text: 'Ладно,\nчто делаешь сейчас?',
    },
    {
      author: { name: 'Госпожа Аня Отбивная' },
      text: 'Думаю,\nготовить ужин или заказать что-нибудь.',
    },
    {
      author: { name: 'me' },
      text: 'Заказать — всегда звучит убедительно.\nОсобенно после такого дня.',
    },
    {
      author: { name: 'Госпожа Аня Отбивная' },
      text: 'Вот!\nНаконец-то человек, который меня понимает.',
    },
    {
      author: { name: 'me' },
      text: 'Я вообще много чего понимаю.\nИногда даже себя.',
    },
    {
      author: { name: 'Госпожа Аня Отбивная' },
      text: 'Это уже редкий навык.\nГоржусь.',
    },
    {
      author: { name: 'me' },
      text: 'Тогда я официально разрешаю себе отдохнуть.',
    },
    {
      author: { name: 'Госпожа Аня Отбивная' },
      text: 'Одобрено.\nОтдыхай и не пропадайa',
    },
  ].toReversed(),
);
