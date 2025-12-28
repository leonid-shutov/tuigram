const trim = (text) => {
  const firstLine = text.split("\n")[0];
  return firstLine.slice(0, module.container.width - 5);
};

(i, { name, lastMessage, selected, opened, isLast }) => {
  name = trim(name);
  lastMessage = trim(lastMessage);
  //const border = isLast ? "" : "⎽".repeat(module.container.width) && "";
  const padding = "  ";

  return blessed.box({
    top: i * module.config.itemHeight,
    height: module.config.itemHeight,
    tags: true,
    content: `\n${padding}{bold}${name}{/bold}\n${padding}${lastMessage}`,
    style: {
      //fg: "white",
      fg: opened ? "red" : selected ? "#39CCCC" : undefined,
    },
  });
};
