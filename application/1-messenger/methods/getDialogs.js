//(() =>
//async function* (chunkSize) {
//const iterator = messenger.tg.iterDialogs({ chunkSize });
//let page = [];
//for await (const dialog of iterator) {
//page.push({
//name: dialog.peer.displayName,
//lastMessage: dialog.lastMessage.text,
//});
//if (page.length === chunkSize) {
//yield page;
//page = [];
//}
//}
//if (page.length > 0) yield page;
//})();

((source) =>
  async function* (chunkSize) {
    let page = [];
    for (const dialog of source) {
      page.push(dialog);
      if (page.length === chunkSize) {
        yield page;
        page = [];
      }
    }
    if (page.length > 0) yield page;
  })([
  {
    chatId: "1",
    name: "Дмитрий Чугай",
    lastMessage: "1",
  },
  { name: "Госпожа Аня Отбивная", lastMessage: "2" },
  {
    name: "Kek",
    lastMessage: "3 akdjalkdjadj ad asd adklj adkj asldk jasldk jsaldk jsad ",
  },
  { name: "Госпожа Аня Отбивная", lastMessage: "4" },
  { name: "Госпожа Аня Отбивная", lastMessage: "5" },
  { name: "azazazaz", lastMessage: "6" },
  { name: "Госпожа Аня Отбивная", lastMessage: "7" },
  { name: "Госпожа Аня Отбивная", lastMessage: "8" },
  { name: "Госпожа Аня Отбивная", lastMessage: "9" },
  { name: "Kek", lastMessage: "10" },
  { name: "Госпожа Аня Отбивная", lastMessage: "11" },
  { name: "Госпожа Аня Отбивная", lastMessage: "12" },
  { name: "azazazaz", lastMessage: "13" },
  { name: "Госпожа Аня Отбивная", lastMessage: "14" },
  { name: "Госпожа Аня Отбивная", lastMessage: "15" },
]);
