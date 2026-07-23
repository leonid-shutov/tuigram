async () => {
  const buffer = await nvim.client.buffer;
  await buffer.setLines([''], { start: 0, end: -1, strictIndexing: false });
  self.input.replaceText('');
  self.input.setCursor(0, 0);
  self.input.height = 1;
};
