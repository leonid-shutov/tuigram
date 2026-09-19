let crashing = false;

/** @type {typeof Crash.hard} */
(error, notice = 'crashed') => {
  if (crashing) process.exit(1);
  crashing = true;
  // `screen` does not exist until 02-screen starts loading, so a boot crash must not
  // ReferenceError here; `typeof` is the only safe probe in the VM sandbox.
  if (typeof screen !== 'undefined' && screen.renderer !== undefined) {
    Result.from(() => screen.renderer.destroy()); // may already be destroyed
  }
  process.stderr.write(`tuigram: ${notice}: ${errorDetail(error)}\n`);
  process.exit(1);
};
