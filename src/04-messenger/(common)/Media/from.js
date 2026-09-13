// Normalises mtcute's media into a plain, presentation-free descriptor: a `type` plus the
// metadata mtcute has already parsed.
const { Thumbnail } = npm['@mtcute/node'];

// The stripped thumbnail ('i') is a ~40px JPEG carried inside the message; mtcute's Thumbnail
// splices the standard JPEG tables back on, so these bytes are decodable with no download.
// The 320px one ('m') costs a request, so keep only its file id and leave fetching to the UI.
/** @param {import('@mtcute/node').Photo | import('@mtcute/node').Video} media */
const image = (media) => {
  const stripped = media.getThumbnail(Thumbnail.THUMB_STRIP)?.location;
  return {
    preview: ArrayBuffer.isView(stripped) ? stripped : null,
    thumbId: media.getThumbnail(Thumbnail.THUMB_320x320_BOX)?.fileId ?? null,
    width: media.width,
    height: media.height,
  };
};

/** @type {typeof Media.from} */
(message) => {
  // .media rebuilds its object on every access, so read it once.
  const media = message.media;

  if (media === null) {
    // mtcute returns null both for "no media" and for a type it doesn't model; only latter is media.
    const { raw, action } = message;
    if (action?.type === 'call') {
      const reason =
        action.reason?._ === 'phoneCallDiscardReasonMissed'
          ? 'missed'
          : action.reason?._ === 'phoneCallDiscardReasonBusy'
            ? 'busy'
            : action.reason?._ === 'phoneCallDiscardReasonDisconnect'
              ? 'disconnect'
              : null;
      return { type: 'call', isVideo: action.isVideo, duration: action.duration, reason };
    }
    const attached = raw._ !== 'messageService' && raw.media && raw.media._ !== 'messageMediaEmpty';
    return attached ? { type: 'unknown' } : null;
  }

  const { type } = media;
  switch (type) {
    case 'photo':
      return { type, ...image(media) };
    case 'video':
      return {
        type,
        duration: media.duration,
        isAnimation: media.isAnimation,
        isRound: media.isRound,
        ...image(media),
      };
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
    // location, live_location, story, paid and webpage carry nothing beyond their type
    default:
      return { type };
  }
};
