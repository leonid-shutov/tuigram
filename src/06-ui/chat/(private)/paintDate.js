// The selected message's day and time, so a day whose separator scrolled away under a tall bubble
// still says when it is. Recomputed on every call, so "Today" corrects itself after midnight.
/** @type {ChatSelf['paintDate']} */
() => {
  const date = self.selectedMessage?.date;
  const time = date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  self.component.setTitlePart('date', date === undefined ? '' : `${Day.label(date)} ${time}`);
};
