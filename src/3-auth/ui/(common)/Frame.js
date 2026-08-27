// @ts-check
/**
 * @param {{ title: string, children: OpenTUIChildren }} props
 * @returns {import('@opentui/core').BoxRenderable}
 */
({ title, children }) =>
  Box({
    flexDirection: 'column',
    borderStyle: config.theme.borderStyle,
    customBorderChars: config.theme.borderChars,
    borderColor: config.theme.accent,
    titleColor: config.theme.accent,
    title: ` ${title} `,
    titleAlignment: 'left',
    paddingX: 2,
    children,
  });
