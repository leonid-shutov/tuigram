(textOrLines) => {
  const lines = Array.isArray(textOrLines) ? textOrLines : $.splitLines(textOrLines);

  return lines.reduce((longest, line) => (line.length > longest.length ? line : longest), lines[0]);
};
