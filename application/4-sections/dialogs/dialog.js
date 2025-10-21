(i, { name, lastMessage }) =>
  blessed.box({
    top: i * 3,
    height: 3,
    tags: true,
    content: `{bold}${name}{/bold}\n${lastMessage}\n⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽⎽`,
    style: {
      bg: i === 3 ? "blue" : undefined,
      fg: "white",
    },
  });
