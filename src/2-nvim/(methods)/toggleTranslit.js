() => {
  config.translit = !config.translit;
  nvim.client.command(`set iminsert=${config.translit ? 1 : 0}`);
  nvim.emit('translit', config.translit);
};
