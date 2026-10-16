// Whether `◖` and `◗` come out as a pill's round ends. That is the font's doing, and no terminal
// reports a glyph's shape, so this goes by name: a terminal joins the list once someone has seen
// them look right in it (alacritty draws them as small bumps). Anything else — including a name
// not known yet, or a multiplexer answering for its host — gets the square ends that look right
// everywhere. opentui names kitty only from its XTVERSION reply, so its own variables back that up:
// KITTY_WINDOW_ID survives into a tmux running inside it, TERM=xterm-kitty into an ssh session.
const ROUND = ['kitty'];

/** @type {() => ScreenModule['drawsHalfDiscs']} */
() => {
  const name = screen.renderer.capabilities?.terminal.name.toLowerCase() ?? '';
  if (ROUND.some((terminal) => name.includes(terminal))) return true;
  return process.env.KITTY_WINDOW_ID !== undefined || process.env.TERM === 'xterm-kitty';
};
