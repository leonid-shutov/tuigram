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

/** @type {ChatSelf['paintHeader']} */
(receipt, presence) => {
  self.component.setTitlePart('receipt', receipt ?? '');
  self.component.setTitlePart('presence', presence === null ? '' : describe(presence));
};
