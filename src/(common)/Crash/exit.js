// The graceful counterpart to hard.js, and the app's only clean-shutdown path. It lives here
// rather than in 3-auth (where it began, as auth.exit) because 8-actions/upgrade.js needs it
// too, and reaching back into the auth layer for a lifecycle primitive is backwards.
let exiting = false;

/** @type {typeof Crash.exit} */
(message, code) => {
  if (exiting) return;
  exiting = true;

  const done = () => {
    if (message !== null) process.stderr.write(`tuigram: ${message}\n`);
    process.exit(code);
  };

  if (typeof auth !== 'undefined') Result.from(() => auth.ui.dispose());
  /** @type {Promise<unknown>[]} */
  const closing = [];
  // opentui restores the terminal after `destroy` returns; exiting before `closed` settles (it
  // does within a second, or rejects) would leave it raw and on the alternate screen.
  if (typeof screen !== 'undefined' && screen.renderer !== undefined) {
    Result.from(() => screen.renderer.destroy());
    closing.push(Result.fromPromise(screen.renderer.closed));
  }

  // auth.client only exists from 3-auth/3-client.js on — `logout` with no session file
  // (2-notSignedIn.js) exits before that.
  if (typeof auth !== 'undefined' && auth.client !== undefined) {
    closing.push(Result.fromPromise(auth.client.destroy()));
  }
  Promise.all(closing).then(done);
};
