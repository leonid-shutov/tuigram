// @ts-check
/**
 * @param {string} text
 * @returns {import('../../../../types/domain').AppMessage}
 */
(text) => ({
  id: Random.uuid(),
  text,
  media: null,
  pending: true,
  sender: { id: null, isSelf: true, displayName: null },
  chatId: null,
  chatName: null,
  isGroup: false,
});
