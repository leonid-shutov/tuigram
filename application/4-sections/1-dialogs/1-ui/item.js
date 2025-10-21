const trim = (text) => {
  const firstLine = text.split("\n")[0];
  return firstLine.slice(0, module.container.width - 5);
};

(i, { name, lastMessage, selected, opened }) => {
  name = trim(name);
  lastMessage = trim(lastMessage);
  const border = "⎽".repeat(module.container.width);
  const padding = "  ";

  return blessed.box({
    top: i * module.config.itemHeight,
    height: module.config.itemHeight,
    tags: true,
    content: `\n${padding}{bold}${name}{/bold}\n${padding}${lastMessage}\n${border}`,
    style: {
      fg: "white",
      bg: opened ? "red" : selected ? "#39CCCC" : undefined,
    },
  });
};
