async () => {
  const [y, x] = await self.nvim.window.cursor;
  input.setCursor(y - 1, x);
};
