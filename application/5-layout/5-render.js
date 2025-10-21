for (const section of Object.values(sections)) {
  section.appendTo(screen);
}
screen.render();

sections.dialogs.addDialogs(
  {
    name: "Дмитрий Чугай",
    lastMessage: "Здарова, как дела?",
  },
  { name: "Госпожа Аня Отбивная", lastMessage: "Ты бублик" },
  { name: "Kek", lastMessage: "Hello world" },
  { name: "Госпожа Аня Отбивная", lastMessage: "Ты бублик" },
  { name: "Госпожа Аня Отбивная", lastMessage: "Ты бублик" },
  { name: "Госпожа Аня Отбивная", lastMessage: "Ты бублик" },
  { name: "Госпожа Аня Отбивная", lastMessage: "Ты бублик" },
  { name: "Госпожа Аня Отбивная", lastMessage: "Ты бублик" },
);
