const keys = Keymap.host.createDefaultOpenTuiKeymap(screen.renderer);

const CYRILLIC = 'йцукенгшщзхъфывапролджэячсмитьбюё';
// eslint-disable-next-line quotes -- the row it mirrors contains an apostrophe
const LATIN = "qwertyuiop[]asdfghjkl;'zxcvbnm,.`";

const layout = new Map();
for (const [index, char] of [...CYRILLIC].entries()) {
  layout.set(char, { name: LATIN[index], shift: false });
  // Uppercase Cyrillic arrives as its own character with `shift: false`, so the stroke carries it.
  layout.set(char.toUpperCase(), { name: LATIN[index], shift: true });
}

keys.appendEventMatchResolver((event, ctx) => {
  const latin = layout.get(event.name);
  if (latin === undefined) return [];
  const stroke = {
    name: latin.name,
    ctrl: event.ctrl,
    shift: latin.shift || event.shift,
    meta: event.meta,
    super: event.super ?? false,
  };
  return [ctx.resolveKey(stroke)];
});

keys.on('warning', (event) => console.log(`keymap warning: ${event.code} ${event.message}`));
keys.on('error', (event) => console.log(`keymap error: ${event.code} ${event.message}`));

keys;
