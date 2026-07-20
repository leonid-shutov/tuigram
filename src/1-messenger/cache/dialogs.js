({
  PATH: node.path.join(__rootDir, '/cache/dialogs.json'),
  read: () => {
    const [err, json] = risk(node.fs.readFileSync, self.PATH, { encoding: 'utf-8' });
    if (err !== null) return [];
    return JSON.parse(json);
  },
  append: (dialogs) => {
    const existing = self.read();
    const updated = [...existing, ...dialogs];
    node.fs.writeFileSync(self.PATH, JSON.stringify(updated));
  },
});
