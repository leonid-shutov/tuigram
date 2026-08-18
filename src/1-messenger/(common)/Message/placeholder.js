// Media isn't rendered in the TUI — each type gets a one-line stand-in so the bubble is never
// blank. Everything here comes off metadata mtcute already parsed; nothing is downloaded.
// Returns null for plain text and service messages, which need no stand-in.
//
// Every emoji below has Emoji_Presentation=Yes, so terminals render it two columns wide
// without a VS16 selector. A text-presentation glyph (e.g. 🖼 U+1F5BC) would misalign the
// bubble border by a column.
(message) => {
  const { raw } = message;
  if (raw._ === 'messageService') return null;

  // .media rebuilds its object on every access, so read it once.
  const media = message.media;
  if (media === null) {
    // null covers both "no media" and "a type mtcute doesn't model" — only the latter
    // deserves a placeholder.
    const attached = raw.media && raw.media._ !== 'messageMediaEmpty';
    return attached ? '📎 Attachment' : null;
  }

  const time = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const clip = (s) => (s.length > 40 ? `${s.slice(0, 39)}…` : s);
  // duration is 0 when the sender omitted the attribute
  const withTime = (label, duration) => (duration > 0 ? `${label} ${time(duration)}` : label);

  switch (media.type) {
    case 'photo':
      return '📷 Photo';
    case 'video':
      if (media.isAnimation) return '🎬 GIF';
      return withTime(media.isRound ? '🎥 Video message' : '🎬 Video', media.duration);
    case 'voice':
      return withTime('🎤 Voice', media.duration);
    case 'audio': {
      const title = media.title ?? 'Audio';
      return `🎵 ${clip(media.performer ? `${media.performer} — ${title}` : title)}`;
    }
    case 'sticker':
      return `${media.emoji} Sticker`;
    case 'document':
      return `📄 ${clip(media.fileName ?? media.mimeType)}`;
    case 'location':
      return '📍 Location';
    case 'live_location':
      return '🔴 Live location';
    case 'contact':
      return `👤 ${clip(`${media.firstName} ${media.lastName}`.trim())}`;
    case 'poll':
      return `📊 Poll: ${clip(media.question)}`;
    case 'dice':
      // the die/dart/slot emoji is the media's own, like a sticker's
      return `${media.emoji} ${media.value}`;
    case 'game':
      return `🎮 ${clip(media.title)}`;
    case 'invoice':
      return `🧾 ${clip(media.title)}`;
    case 'venue':
      return `🏢 ${clip(media.title)}`;
    case 'story':
      return '📖 Story';
    case 'paid':
      return '💰 Paid media';
    case 'todo':
      return `✅ ${clip(media.title.text)}`;
    // a link preview always carries its URL in .text
    case 'webpage':
      return null;
    default:
      return '📎 Attachment';
  }
};
