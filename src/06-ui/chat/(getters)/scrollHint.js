// How to scroll the selected post's text, while its height cap cuts it off and the chat is the
// selected section; blank otherwise. Every style says it here, on the section's bottom border, since
// not every style has a bottom border of its own to say it on.
/** @type {() => ChatSelf['scrollHint']} */
() => {
  const text = self.selectedText;
  return self.focused && text !== null && text.visible && text.maxScrollY > 0 ? 'shift+↓/↑ scroll' : '';
};
