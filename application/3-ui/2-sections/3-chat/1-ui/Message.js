({
  from: ({ text, selected }) => Box.from(text, { border: selected ? 'green' : undefined }),
  calcHeight: (text) => Text.numberOfLines(self.from(text).content),
});
