(text) => {
  const tempId = Random.uuid();
  self.addMessage({ id: tempId, text, sender: { isSelf: true } });
  return tempId;
};
