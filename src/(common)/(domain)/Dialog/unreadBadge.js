/** @type {typeof Dialog.unreadBadge} */
(count) => {
  if (count <= 0) return null;
  return count > 999 ? '999+' : String(count);
};
