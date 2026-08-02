async () => {
  const buffer = await self.nvim.buffer;
  await buffer.setLines([''], { start: 0, end: -1, strictIndexing: false });
  input.replaceText('');
  input.setCursor(0, 0);
  input.height = 1;
};
