(i, { name, lastMessage }) =>
  blessed.box({
    top: i * 4,
    height: 4,
    tags: true,
    content: `\n  {bold}${name}{/bold}\n  ${lastMessage}\n⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽`,
    style: {
      fg: "white",
    },
  });
