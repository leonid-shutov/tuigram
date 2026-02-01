const DEFAULT_PADDING = 1;
const RESET = '\x1b[0m';

const BORDER_COLORS = {
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

({
  from: (text, options) => {
    const padding = options?.padding ?? DEFAULT_PADDING;

    const colorName = options?.border?.toLowerCase();
    const COLOR = BORDER_COLORS[colorName] ?? '';

    const lines = Text.splitLines(text);
    const borderLen = Text.longestLine(lines).length + padding * 2;

    const body = lines
      .map((line) => `${COLOR}│${RESET} ${line}${' '.repeat(borderLen - line.length - padding)}${COLOR}│${RESET}`)
      .join('\n');

    const topLine = `${COLOR}╭${'─'.repeat(borderLen)}╮${RESET}`;
    const bottomLine = `${COLOR}╰${'─'.repeat(borderLen)}╯${RESET}`;

    return {
      content: `${topLine}\n${body}\n${bottomLine}`,
      height: lines.length + 2,
      width: borderLen + 3,
    };
  },
});
