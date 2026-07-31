({ text, sender }) => {
  const box = Box({
    flexDirection: 'column',
    borderStyle: 'rounded',
    borderColor: sender.isSelf ? '#283457' : '#1f2335',
    paddingX: 1,
    alignSelf: sender.isSelf ? 'flex-end' : 'flex-start',
    focusedBorderColor: 'green',
    focusable: true,
  });

  box.add(Text({ content: text, fg: '#c0caf5' }));

  return box;
};
