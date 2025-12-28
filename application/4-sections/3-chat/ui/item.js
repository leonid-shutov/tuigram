const getLongest = (lines) =>
  lines.reduce(
    (longest, line) => (line.length > longest.length ? line : longest),
    lines[0],
  );

const getMessageStats = (message) => {
  const lines = message.split("\n");
  return {
    maxLineLength: getLongest(lines).length,
    numberOflines: lines.length,
  };
};

(message, { top }) => {
  const stats = getMessageStats(message.text);

  return blessed.box({
    top,
    height: stats.numberOflines,
    width: stats.maxLineLength,
    ...(message.author.name === "me" ? { right: 2 } : { left: 2 }),
    content: message.text,
    style: {
      //bg: "blue",
    },
  });
};
