let crashing = false;

// Synchronous to the end: a crash stops the app at once, so nothing more runs on broken state, and
// callers guard with it (`if (missing) Crash.hard(...)`) as if it never returned. So it can't wait
// for `renderer.closed` the way Crash.exit does, and leans on opentui's documented last-chance
// restore instead: as the process exits, the renderer's own `exit` listener restores the terminal
// synchronously (https://opentui.com/docs/core-concepts/lifecycle/, "Process Exit Behavior"; best
// effort, so a frame cut off mid-write may restore imperfectly). The report is written from a
// listener added now, which Node runs after that one: onto the restored terminal, not the
// alternate screen it would vanish with.
/** @type {typeof Crash.hard} */
(error, notice = 'crashed') => {
  if (crashing) process.exit(1);
  crashing = true;
  const detail = Explain.stack(error);
  process.once('exit', () => crashReport(notice, detail));
  process.exit(1);
};
