// Colors are the terminal's, not ours: every role below resolves to an ANSI palette slot or to
// the terminal's own default fg/bg, so tuigram inherits whatever theme the user runs.
//
// This is the first of two phases. Asking the terminal what its colors are needs the renderer
// to own stdin, which does not exist yet at layer 1 — so assume dark here and let
// 2-screen/3-refreshTheme.js refine it in place before any UI is built.
Theme.derive('dark', null);
