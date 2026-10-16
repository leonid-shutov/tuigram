/** @type {Record<string, import('../../../types/domain').EntityKind>} */
const KINDS = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  strikethrough: 'strikethrough',
  spoiler: 'spoiler',
  code: 'code',
  pre: 'pre',
  blockquote: 'blockquote',
  mention: 'mention',
  hashtag: 'mention',
  cashtag: 'mention',
  bot_command: 'mention',
  text_mention: 'mention',
};

// Telegram marks a bare `example.com` as a URL too, with no scheme to open it by.
/** @param {string} text */
const withScheme = (text) => (/^[a-z][a-z\d+.-]*:/iu.test(text) ? text : `https://${text}`);

/** @param {import('@mtcute/node').MessageEntity} entity @returns {string | null} */
const target = (entity) => {
  const { params } = entity;
  if (params.kind === 'text_link') return params.url;
  if (params.kind === 'url') return withScheme(entity.text);
  if (params.kind === 'email') return `mailto:${entity.text}`;
  return null;
};

/** @type {MessengerSelf['toEntities']} */
(entities) => {
  /** @type {import('../../../types/domain').Entity[]} */
  const result = [];
  for (const entity of entities) {
    const { offset, length, kind } = entity;
    const url = target(entity);
    if (url !== null) result.push({ offset, length, kind: 'link', url: Link.safe(url) });
    else if (Object.hasOwn(KINDS, kind)) result.push({ offset, length, kind: KINDS[kind] });
  }
  return result;
};
