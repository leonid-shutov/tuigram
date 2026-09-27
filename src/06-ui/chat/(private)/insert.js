/** @type {ChatSelf['insert']} */
(message, index) => {
  const { media } = message;
  const protocol = config.imageProtocol;
  // Whether a message gets a thumbnail at all is decided here; Picture only draws one.
  const drawable = protocol !== 'off' && Media.isImage(media);
  const picture = drawable ? Picture(media, protocol) : null;
  // `flexShrink: 1` (opentui's default, spelled out because it matters) so this is the child that
  // yields to the bubble's height cap: yoga hands it whatever rows are left after the picture and
  // label keep theirs, and it becomes the bubble's scroll window — see Bubble.js and scrollMessage.
  const text = message.text ? Text({ content: message.text, fg: config.theme.fg, flexShrink: 1 }) : null;
  const bubble = Bubble(message, picture, text);
  self.scroll.add(bubble, index);
  self.bubbles.set(message.id, { bubble, picture, text });
};
