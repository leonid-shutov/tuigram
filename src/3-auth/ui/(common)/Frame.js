/** @type {typeof Frame} */
({ title, children }) =>
  Box({
    flexDirection: 'column',
    borderStyle: config.borders.style,
    customBorderChars: config.borders.chars,
    borderColor: config.theme.accent,
    titleColor: config.theme.accent,
    title: ` ${title} `,
    titleAlignment: 'left',
    paddingX: 2,
    children,
  });
