const getLongest = (lines) =>
  lines.reduce(
    (longest, line) => (line.length > longest.length ? line : longest),
    lines[0],
  );

const PADDING = 1;
const MARGIN = 2;

const withRoundBorder = (text) => {
  const lines = text.split("\n");
  const borderLen = getLongest(lines).length + PADDING * 2;
  text = lines
    .map((line) => `│ ${line}${" ".repeat(borderLen - line.length - PADDING)}│`)
    .join("\n");
  const topLine = `╭${"─".repeat(borderLen)}╮`;
  const bottomLine = `╰${"─".repeat(borderLen)}╯`;
  return `${topLine}\n${text}\n${bottomLine}`;
};

(message, { top }) => {
  const text = withRoundBorder(message.text);
  const width = text.split("\n")[0].length;

  return blessed.box({
    top,
    width,
    ...(message.author.name === "me" ? { right: MARGIN } : { left: MARGIN }),
    tags: true,
    content: text,
    style: {
      //bg: message.author.name === "me" ? "blue" : "green",
    },
  });
};
