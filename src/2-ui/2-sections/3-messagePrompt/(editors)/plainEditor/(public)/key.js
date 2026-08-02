(event) => {
  const { name, shift, option } = event;
  if (name === 'escape') self.exit();
  else if (name === 'return' && !shift && !option) self.send();
  else self.type(event);
};
