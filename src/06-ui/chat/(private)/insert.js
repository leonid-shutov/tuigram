/** @type {ChatSelf['insert']} */
(message, index) => {
  const { media } = message;
  const protocol = config.imageProtocol;
  // Whether a message gets a thumbnail at all is decided here; Picture only draws one.
  const drawable = protocol !== 'off' && Media.isImage(media);
  const picture = drawable ? Picture(media, protocol) : null;
  // `flexShrink: 0` so the bubble's height cap cuts this text off rather than squeezing it onto
  // fewer lines alongside its siblings — see Bubble.js.
  const text = message.text ? Text({ content: message.text, fg: config.theme.fg, flexShrink: 0 }) : null;
  const bubble = Bubble(message, picture, text);
  self.scroll.add(bubble, index);
  self.bubbles.set(message.id, { bubble, picture, text });
};
