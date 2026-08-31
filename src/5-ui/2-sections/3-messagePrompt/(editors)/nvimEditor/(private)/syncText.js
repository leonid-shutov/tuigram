/** @type {NvimEditorSelf['syncText']} */
async () => {
  const buffer = await self.nvim.buffer;
  const lines = await buffer.lines;
  input.replaceText(lines.join('\n'));
  await self.syncCursor();
  input.height = lines.length > 0 ? lines.length : 1;
};
