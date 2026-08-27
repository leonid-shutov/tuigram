/** @type {NvimEditorSelf['syncCursor']} */
async () => {
  const [y, x] = await self.nvim.window.cursor;
  ui.sections.messagePrompt.input.setCursor(y - 1, x);
};
