//(() =>
//async function* (chatId, pageSize) {
//const cachedMessages = module.cache.chats.get(chatId) ?? [];
//cachedMessages.forEach(yield);

//let offset = cachedMessages.at(-1)?.next ?? undefined;
//while (true) {
//const params = { offset, limit: pageSize };
//const messages = await messenger.tg.getHistory(chatId, params);

//cachedMessages.push(messages);
//yield messages;

//if (messages.next === undefined) return;
//offset = messages.next;
//}
//})();

(() =>
  async function* (chatId, pageSize) {
    const cachedMessages = module.cache.chats.get(chatId) ?? [[]];
    yield cachedMessages;

    //let offset = cachedMessages.at(-1)?.next ?? undefined;
    //while (true) {
    //const params = { offset, limit: pageSize };
    //const messages = await messenger.tg.getHistory(chatId, params);

    //cachedMessages.push(messages);
    //yield messages;

    //if (messages.next === undefined) return;
    //offset = messages.next;
    //}
  })();
