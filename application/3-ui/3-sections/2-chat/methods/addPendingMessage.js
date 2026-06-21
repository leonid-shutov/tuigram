(text) => {
  const tempId = Random.uuid();
  $.addMessage({ id: tempId, text, sender: { isSelf: true } });
  return tempId;
};
