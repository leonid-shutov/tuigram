// Start over as if launched anew: bin/tuigram.js runs the app again when it exits with
// `__restartExitCode`. Simpler than keeping a long-lived session in sync after a suspend.
/** @type {Actions['restart']} */
() => {
  console.log('[app] restarting');
  Crash.exit(null, __restartExitCode);
};
