/** @param {string} s */
const clip = (s) => (s.length > 40 ? `${s.slice(0, 39)}…` : s);
/** @param {number} s */
const time = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
// duration is 0 when the sender omitted the attribute
/**
 * @param {string} text
 * @param {number} duration
 */
const withTime = (text, duration) => (duration > 0 ? `${text} ${time(duration)}` : text);

/** @type {typeof Preview.ofMedia} */
(media) => {
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
    // the die/dart/slot emoji is the media's own, like a sticker's
    case 'dice':
      return `${media.emoji} ${media.value}`;
    case 'game':
      return `🎮 ${clip(media.title)}`;
    case 'invoice':
      return `🧾 ${clip(media.title)}`;
    case 'venue':
      return `🏢 ${clip(media.title)}`;
    case 'call': {
      if (media.reason === 'missed') return media.isVideo ? '📵 Missed video call' : '📵 Missed call';
      const kind = media.isVideo ? 'Video call' : 'Call';
      if (media.reason === 'busy') return `📞 ${kind} (busy)`;
      if (media.reason === 'disconnect') return `📞 ${kind} (dropped)`;
      return withTime(`📞 ${kind}`, media.duration);
    }
    case 'story':
      return '📖 Story';
    case 'paid':
      return '💰 Paid media';
    case 'todo':
      return `✅ ${clip(media.title)}`;
    // a link preview always carries its URL in the message text
    case 'webpage':
      return '';
    default:
      return '📎 Attachment';
  }
};
