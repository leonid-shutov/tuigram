let crashing = false;

/** @type {typeof Crash.hard} */
(error, notice = 'crashed') => {
  if (crashing) process.exit(1);
  crashing = true;
  if (typeof screen !== 'undefined' && screen.renderer !== undefined) {
    Result.from(() => screen.renderer.destroy()); // may already be destroyed
  }
  crashReport(notice, Explain.stack(error));
  process.exit(1);
};
