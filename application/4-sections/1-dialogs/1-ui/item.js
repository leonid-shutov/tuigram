const trim = (text) => {
  const firstLine = text.split("\n")[0];
  const maxLen = module.container.width - 7;
  if (firstLine.length <= maxLen) return firstLine;
  else return firstLine.substring(0, maxLen - 3) + "...";
};

(i, { name, lastMessage, selected, opened, isLast }) => {
  name = trim(name);
  lastMessage = trim(lastMessage);
  if (selected) {
    name = `{white-bg} {/white-bg}  {bold}${name}{/bold}`;
    lastMessage = `{white-bg} {/white-bg}  {green-fg}${lastMessage}{/green-fg}`;
  } else {
    name = `   {bold}${name}{/bold}`;
    lastMessage = `   {green-fg}${lastMessage}{/green-fg}`;
  }

  const itemContainer = blessed.box({
    top: i * module.config.itemHeight,
    height: module.config.itemHeight,
  });

  blessed.box({ parent: itemContainer, height: 1 });
  blessed.box({
    parent: itemContainer,
    height: 2,
    tags: true,
    content: `${name}\n${lastMessage}`,
    style: {
      //bg: selected ? "green" : undefined,
      //fg: "white",
      //fg: opened ? "red" : selected ? "#39CCCC" : undefined,
    },
  });

  return itemContainer;
};
