/** @type {typeof Message.quote} */
(target) => {
  if (target === null) return { sender: null, preview: null, deleted: true };
  const { id, isSelf, displayName } = target.sender;
  let name = displayName ?? 'Deleted account';
  if (isSelf) name = 'You';
  return { sender: { id, displayName: name }, preview: Message.preview(target), deleted: false };
};
