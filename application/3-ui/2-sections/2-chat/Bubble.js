({ text, author }) => {
  const isMe = author.name === 'me';
  const box = new tui.BoxRenderable(ui.screen.renderer, {
    flexDirection: 'column',
    borderStyle: 'rounded',
    borderColor: isMe ? '#283457' : '#1f2335',
    paddingX: 1,
    alignSelf: isMe ? 'flex-end' : 'flex-start',
    focusedBorderColor: 'green',
  });

  box.add(new tui.TextRenderable(ui.screen.renderer, { content: text, fg: '#c0caf5' }));

  return box;
};
