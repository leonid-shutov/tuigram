({
  _getPath: (chatId) => node.path.join(__rootDir, `/cache/chats/${chatId}.json`),
  read: (chatId) => {
    const path = self._getPath(chatId);
    const [err, json] = risk(node.fs.readFileSync, path, { encoding: 'utf-8' });
    if (err !== null) return [];
    return JSON.parse(json);
  },
  append: (chatId, messages) => {
    const existing = self.read(chatId);
    const updated = [...existing, ...messages];
    const path = self._getPath(chatId);
    node.fs.writeFileSync(path, JSON.stringify(updated));
  },
});
