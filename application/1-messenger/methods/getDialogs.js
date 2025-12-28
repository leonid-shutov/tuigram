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
    name: "Patterns 2025 🌱 All",
    lastMessage: "https://youtu.be/U8p7Ok1629g",
    chatId: "1",
  },
  { name: "Leonid", lastMessage: "blabl\na sda sdas d asd asd \nasd asd asd" },
  { name: "Patterns 2025: S02", lastMessage: "https://youtu.be/BH7ajeIIaLA" },
  { name: "Госпожа Аня Отбивная", lastMessage: "Не буду" },
  { name: "Батя", lastMessage: "Липкий снег. Около 0 градусов" },
  {
    name: "NodeUA - JavaScript and Node.js in Ukraine",
    lastMessage: "it's best avoided if possible. \nДуже корисна фіча",
  },
  {
    name: "Топор+",
    lastMessage: "Волк с Уолл-стрит, наши дни.\n\n👉 Топор +18. Подписаться",
  },
  {
    name: "Космос рофлов",
    lastMessage:
      "Если маленький дракула не вернулся из школы – значит ему поставили кол\nкосмос рофлов ✨",
  },
  {
    name: "Catricaps ; Катриоша",
    lastMessage:
      "На этом маркете был самый мощный товарный обмен с другими авторами\n\nЗавтра постараюсь все показать\n\nТам и украшения, и керамика, и куча стикеров, просто МОООЩЩЩЩЬЬЬЬ",
  },
]);
