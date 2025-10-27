//(() =>
//async function* (chunkSize) {
//const iterator = messenger.tg.iterDialogs({ chunkSize });
//let page = [];
//for await (const dialog of iterator) {
//page.push(dialog);
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
    name: "Дмитрий Чугай",
    lastMessage: "Здарова, как дела?",
  },
  { name: "Госпожа Аня Отбивная", lastMessage: "Ты бублик" },
  { name: "Kek", lastMessage: "Hello world" },
  { name: "Госпожа Аня Отбивная", lastMessage: "Ты бублик" },
  { name: "Госпожа Аня Отбивная", lastMessage: "Ты бублик" },
  { name: "azazazaz", lastMessage: "Ты бублик" },
  { name: "Госпожа Аня Отбивная", lastMessage: "Ты бублик" },
  { name: "Госпожа Аня Отбивная", lastMessage: "Ты бублик" },
  { name: "Госпожа Аня Отбивная", lastMessage: "Ты бублик" },
  { name: "Kek", lastMessage: "Hello world" },
  { name: "Госпожа Аня Отбивная", lastMessage: "Ты бублик" },
  { name: "Госпожа Аня Отбивная", lastMessage: "Ты бублик" },
  { name: "azazazaz", lastMessage: "Ты бублик" },
  { name: "Госпожа Аня Отбивная", lastMessage: "Ты бублик" },
  { name: "Госпожа Аня Отбивная", lastMessage: "Ты бублик" },
]);
