const MARGIN = 2;

(message, { top }) => {
  const content = Box.from(message.text);
  const width = Text.firstLine(content).length;

  const isFromMyself = message.author.name === 'me';
  const rightLeft = isFromMyself ? { right: MARGIN } : { left: MARGIN };

  return blessed.box({
    top,
    width,
    ...rightLeft,
    tags: true,
    content,
    style: {
      //bg: message.author.name === "me" ? "blue" : "green",
    },
  });
};
