(event) => {
  if (event.name === 'return' && self.mode === 'normal') self.send();
  else self.feed(event);
};
