const DEFAULT_PADDING = 1;

({
  from: (text, options) => {
    const padding = options?.padding ?? DEFAULT_PADDING;
    const lines = Text.splitLines(text);
    const borderLen = Text.longestLine(lines).length + padding * 2;
    text = lines.map((line) => `│ ${line}${' '.repeat(borderLen - line.length - padding)}│`).join('\n');
    const topLine = `╭${'─'.repeat(borderLen)}╮`;
    const bottomLine = `╰${'─'.repeat(borderLen)}╯`;
    return `${topLine}\n${text}\n${bottomLine}`;
  },
});
