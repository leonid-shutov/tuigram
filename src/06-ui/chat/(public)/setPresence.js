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
  if (presence.status === 'online') return { text: 'online', color: config.theme.accent };
  if (presence.status === 'offline') {
    if (presence.lastOnline === null) return { text: 'offline', color: config.theme.muted };
    const seenToday = presence.lastOnline.toDateString() === new Date().toDateString();
    const when = seenToday
      ? presence.lastOnline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : presence.lastOnline.toLocaleDateString();
    return { text: `last seen ${when}`, color: config.theme.muted };
  }
  return { text: BUCKET_LABEL[presence.status], color: config.theme.muted };
};

/** @type {ChatSection['setPresence']} */
(presence) => {
  if (presence === null) return void (self.headerPresence.content = '');
  const { text, color } = describe(presence);
  self.headerPresence.content = new tui.StyledText([tui.fg(color)(text)]);
};
