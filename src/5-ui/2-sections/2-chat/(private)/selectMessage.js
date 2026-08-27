/** @type {ChatSelf['selectMessage']} */
(message) => {
  self.selectedMessage = message;
  // Nothing to scroll to on an empty chat, or before the bubble has been rendered.
  const bubble = message?.value.bubble;
  if (bubble === undefined) return;
  self.component.scrollChildIntoView(bubble.id);
  bubble.focus();
};
