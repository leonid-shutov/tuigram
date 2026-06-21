(tempId, confirmedMessage) => {
  const pendingMessage = $.messages.find(({ id }) => id === tempId);
  pendingMessage.id = confirmedMessage.id;
};
