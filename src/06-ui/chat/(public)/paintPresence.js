/** Static wording for mtcute's coarse last-seen buckets — everything but the exact-offline case,
 * which is the only one that needs real date math. */
const BUCKET_LABEL = {
  recently: 'last seen recently',
  within_week: 'last seen within a week',
  within_month: 'last seen within a month',
  long_time_ago: 'last seen a long time ago',
};

/** @param {import('../../../../types/domain').Presence} presence */
const describe = (presence) => {
  if (presence.status === 'online') return 'online';
  if (presence.status === 'offline') {
    if (presence.lastOnline === null) return 'offline';
    const seenToday = presence.lastOnline.toDateString() === new Date().toDateString();
    const when = seenToday
      ? presence.lastOnline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : presence.lastOnline.toLocaleDateString();
    return `last seen ${when}`;
  }
  return BUCKET_LABEL[presence.status];
};

/** What each status has someone doing, as Telegram's own clients word it. */
const DOING = {
  typing: 'typing',
  record_video: 'recording a video',
  upload_video: 'sending a video',
  record_voice: 'recording a voice message',
  upload_voice: 'sending a voice message',
  upload_photo: 'sending a photo',
  upload_document: 'sending a file',
  geo: 'choosing a location',
  contact: 'choosing a contact',
  game: 'playing a game',
  record_round: 'recording a video message',
  upload_round: 'sending a video message',
  speak_call: 'speaking',
  history_import: 'importing history',
  sticker: 'choosing a sticker',
};

/** One typist says what they're doing; two named ones share "typing"; any more are counted.
 * @param {import('../../../../types/domain').Typist[]} typists */
const describeTyping = ([first, second, ...rest]) => {
  if (second === undefined)
    return first.name === null ? `${DOING[first.status]}…` : `${first.name} is ${DOING[first.status]}…`;
  if (rest.length === 0 && first.name !== null && second.name !== null)
    return `${first.name} and ${second.name} are typing…`;
  return `${2 + rest.length} people are typing…`;
};

/** @type {ChatSection['paintPresence']} */
(presence, typists) => {
  let text = '';
  if (typists.length > 0) text = describeTyping(typists);
  else if (presence !== null) text = describe(presence);
  self.component.setTitlePart('presence', text);
};
