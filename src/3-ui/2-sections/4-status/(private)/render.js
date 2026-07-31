() => {
  const mode = (nvim.mode ?? 'normal').toUpperCase();
  const lang = `TRANSLIT:${config.translit ? 'ON' : 'OFF'}`;
  self.text.content = ` ${mode} · ${lang} `;
};
