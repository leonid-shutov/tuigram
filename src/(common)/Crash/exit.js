// The graceful counterpart to hard.js, and the app's only clean-shutdown path. It lives here
// rather than in 03-auth (where it began, as auth.exit) because 08-actions/upgrade.js needs it
// too, and reaching back into the auth layer for a lifecycle primitive is backwards.
let exiting = false;

/** @type {typeof Crash.exit} */
(message, code) => {
  if (exiting) return;
  exiting = true;

  const done = () => {
    process.stderr.write(`tuigram: ${message}\n`);
    process.exit(code);
  };

  if (typeof auth !== 'undefined') Result.from(() => auth.ui.dispose());
  if (typeof screen !== 'undefined' && screen.renderer !== undefined) {
    Result.from(() => screen.renderer.destroy());
  }

  // auth.client only exists from 03-auth/3-client.js on — `logout` with no session file
  // (2-notSignedIn.js) exits before that.
  if (typeof auth === 'undefined' || auth.client === undefined) return void done();
  Result.fromPromise(auth.client.destroy()).then(done);
};
