// Resolve the theme once, before anything reads it. Components take their colors as
// constructor options in layer 6, so a stale value here would be baked in for the session.
// The loader awaits this promise, which is what makes layers 3-9 wait for the answer.
// A terminal that answers nothing is not an error — layer 1's defaults already work.
self.refreshTheme().catch((/** @type {Error} */ error) => console.log('theme detection failed:', error.message));
