const MARGIN = 2;

({
  from: (message, { top, bottom }) => {
    const { content, width } = $.Message.from(message);

    const isFromMyself = message.author.name === 'me';
    const rightLeft = isFromMyself ? { right: MARGIN - 1 } : { left: MARGIN };

    return blessed.box({
      top,
      bottom,
      width,
      height: Text.numberOfLines(content),
      ...rightLeft,
      tags: true,
      content,
      style: {
        fg: message.selected ? undefined : 'white',
      },
    });
  },
});
