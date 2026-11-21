/** @type {MessagePromptSelf['paintQuote']} */
() => {
  const { quote, rule, quoted, component } = self;
  quote.visible = quoted !== null;
  rule.visible = quoted !== null;
  if (quoted === null) return;
  const { leftT, horizontal, rightT } = config.theme.borderChars ?? tui.BorderChars[config.theme.borderStyle];
  // The border takes a cell each side; the rule runs over it.
  quote.content = Quote.paint(quoted, component.width - 2);
  rule.content = leftT + horizontal.repeat(Math.max(0, component.width - 2)) + rightT;
};
