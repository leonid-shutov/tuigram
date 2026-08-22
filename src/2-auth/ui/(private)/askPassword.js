const isPrintable = (event) =>
  !event.ctrl && !event.meta && event.sequence?.length === 1 && event.sequence >= ' ' && event.sequence !== '\x7f';

({ label, hint }) =>
  new Promise((resolve) => {
    let buffer = '';

    const masked = Text({ content: ' ', fg: config.theme.fg });

    const handle = self.mount({
      title: 'Sign in to Telegram',
      children: [
        Text({ content: label, fg: config.theme.fg }),
        Box({ width: 32, height: 1, backgroundColor: config.theme.surface, children: [masked] }),
        Text({ content: hint, fg: config.theme.muted }),
      ],
    });

    const draw = () => {
      masked.content = '•'.repeat(buffer.length) || ' ';
      handle.render();
    };

    handle.onKey((event) => {
      event.preventDefault();
      if (event.name === 'return' && buffer !== '') resolve(buffer);
      else if (event.name === 'backspace') {
        buffer = buffer.slice(0, -1);
        draw();
      } else if (isPrintable(event)) {
        buffer += event.sequence;
        draw();
      }
    });
  });
