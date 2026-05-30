export function createLineEditor(textarea) {
  return {
    textarea,
    setLines(lines) {
      textarea.setText(lines.join('\n'));
    },
  };
}
