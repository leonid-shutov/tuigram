// The selected message's day and time, so a day whose separator scrolled away still says when it
// is. Recomputed on every call, so "Today" corrects itself after midnight.
/** @type {ChatSelf['paintDate']} */
() => {
  const date = self.selectedMessage?.date;
  self.component.setTitlePart('date', date === undefined ? '' : `${Day.label(date)} ${Day.time(date)}`);
};
