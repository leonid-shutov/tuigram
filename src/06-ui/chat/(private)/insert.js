/** @type {ChatSelf['insert']} */
(message, index) => {
  const { media } = message;
  const protocol = config.imageProtocol;
  // Whether a message gets a thumbnail at all is decided here; Picture only draws one.
  const drawable = protocol !== 'off' && Media.isImage(media);
  const picture = drawable ? Picture(media, protocol) : null;
  const text = message.text ? Text({ content: message.text, fg: config.theme.fg }) : null;
  const bubble = Bubble(message, picture, text);
  self.scroll.add(bubble, index);
  self.bubbles.set(message.id, { bubble, picture, text });
};
