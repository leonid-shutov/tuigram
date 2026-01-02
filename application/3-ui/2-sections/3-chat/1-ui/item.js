const { firstLine } = common.text;
const { withBorders } = ui.common;

const MARGIN = 2;

(message, { top }) => {
  const content = withBorders(message.text);
  const width = firstLine(content).length;

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
