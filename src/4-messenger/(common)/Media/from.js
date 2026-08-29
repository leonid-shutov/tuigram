// @ts-check
// Normalises mtcute's media into a plain, presentation-free descriptor: a `type` plus the
// metadata mtcute has already parsed.
/** @type {typeof Media.from} */
(message) => {
  // .media rebuilds its object on every access, so read it once.
  const media = message.media;

  if (media === null) {
    // mtcute returns null both for "no media" and for a type it doesn't model; only latter is media.
    const { raw } = message;
    const attached = raw._ !== 'messageService' && raw.media && raw.media._ !== 'messageMediaEmpty';
    return attached ? { type: 'unknown' } : null;
  }

  const { type } = media;
  switch (type) {
    case 'video':
      return { type, duration: media.duration, isAnimation: media.isAnimation, isRound: media.isRound };
    case 'voice':
      return { type, duration: media.duration };
    case 'audio':
      return { type, duration: media.duration, title: media.title, performer: media.performer };
    case 'sticker':
      return { type, emoji: media.emoji };
    case 'document':
      return { type, fileName: media.fileName, mimeType: media.mimeType };
    case 'contact':
      return { type, firstName: media.firstName, lastName: media.lastName };
    case 'poll':
      return { type, question: media.question };
    case 'dice':
      return { type, emoji: media.emoji, value: media.value };
    case 'game':
    case 'invoice':
    case 'venue':
      return { type, title: media.title };
    case 'todo':
      return { type, title: media.title.text };
    // photo, location, live_location, story, paid and webpage carry nothing beyond their type
    default:
      return { type };
  }
};
