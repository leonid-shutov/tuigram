// The draft stays: a reply is a new message, so whatever was being typed is what it will say.
// The label is one line however long the original: sender, then as much of its text as fits.
const LABEL_CELLS = 40;

/** @type {MessagePromptSection['reply']} */
(messageId, { sender, preview }) => {
  if (self.editing !== null) self.clearEdit();
  self.replyingTo = messageId;
  const said = preview === null ? '' : `: ${preview}`;
  self.component.bottomTitle = ` replying to ${Cells.ellipsize(`${sender?.displayName ?? ''}${said}`, LABEL_CELLS)} `;
};
