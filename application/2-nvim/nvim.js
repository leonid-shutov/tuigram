({
  input: (char) => self.client.input(char),
  on: (...args) => self.ee.on(...args),

  buffer: null,
  buffers: new Map(),

  createBuffer: async (name) => {
    await self.client.command("enew");
    const buffer = await self.client.buffer;
    await self.client.callFunction("nvim_buf_set_name", [buffer.id, name]);
    return buffer;
  },
  switchBuffer: async (name) => {
    self.buffer = self.buffers.get(name) ?? null;
    if (self.buffer === null) self.buffer = await self.createBuffer(name);
  },
});
