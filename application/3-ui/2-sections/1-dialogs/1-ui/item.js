const trim = (text) => {
  const firstLine = common.text.firstLine(text);
  return firstLine.slice(0, $.container.width - 5);
};

(i, { name, lastMessage, selected, opened, isLast }) => {
  name = trim(name);
  lastMessage = trim(lastMessage);
  const border = isLast ? '' : '⎽'.repeat($.container.width);
  const padding = '  ';

  return blessed.box({
    top: i * $.config.itemHeight,
    height: $.config.itemHeight,
    tags: true,
    content: `\n${padding}{bold}${name}{/bold}\n${padding}${lastMessage}\n${border}`,
    style: {
      fg: 'white',
      bg: opened ? 'red' : selected ? 'green' : undefined,
    },
  });
};
