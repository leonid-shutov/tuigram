(i, { name, lastMessage }) =>
  blessed.box({
    top: i * module.config.itemHeight,
    height: module.config.itemHeight,
    tags: true,
    content: `\n  {bold}${name}{/bold}\n  ${lastMessage}\n⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽`,
    style: {
      fg: "white",
    },
  });
