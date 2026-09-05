// The one place `bubbles` and `pictures` are written. append and prepend differ only in where the
// bubble lands — and `add` treats an undefined index as "at the end" — so the bookkeeping lives
// here rather than being spelled out in both.
/** @type {ChatSelf['insert']} */
(message, index) => {
  const { media } = message;
  const protocol = config.imageProtocol;
  // Whether a message gets a thumbnail at all is decided here; Picture only draws one.
  const drawable = protocol !== 'off' && Media.isImage(media);
  const picture = drawable ? Picture(media, protocol) : null;
  const bubble = Bubble(message, picture);
  self.component.add(bubble, index);
  self.bubbles.set(message.id, bubble);
  if (picture !== null) self.pictures.set(message.id, picture);
};
