(messages) => {
  $.stopLoading();
  for (const message of messages) $.addMessage(message);
};
