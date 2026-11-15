/** @type {ChatMutator<ChatStoreSelf['drop']>} */
const drop = (chat, tempId) => {
  const index = chat.messages.findIndex(({ id }) => id === tempId);
  if (index !== -1) chat.messages.splice(index, 1);
};

ChatMutation(drop);
