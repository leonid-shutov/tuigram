const DEFAULT_PADDING = 1;

const { longestLine, splitLines } = common.text;

(text, options) => {
  const padding = options?.padding ?? DEFAULT_PADDING;
  const lines = splitLines(text);
  const borderLen = longestLine(lines).length + padding * 2;
  text = lines.map((line) => `│ ${line}${' '.repeat(borderLen - line.length - padding)}│`).join('\n');
  const topLine = `╭${'─'.repeat(borderLen)}╮`;
  const bottomLine = `╰${'─'.repeat(borderLen)}╯`;
  return `${topLine}\n${text}\n${bottomLine}`;
};
