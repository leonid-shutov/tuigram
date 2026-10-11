// One sign-in: QR is primary; `p` on the QR screen aborts it and falls back to phone + code.
// Every callback here exists to keep mtcute off stdin and off `console` — its defaults
// (`node:readline`, `console.log`) would fight the renderer. Fresh controller and handler per call:
// a retry must not inherit an already-aborted signal.
const attempt = async () => {
  const controller = new AbortController();
  /** @type {string | null} */
  let invalid = null;
  /** @type {string | null} */
  let sentVia = null;

  const qrCodeHandler = self.ui.qrLogin(() => controller.abort('phone'));

  /** @type {Parameters<typeof auth.client.start>[0]} */
  const params = {
    phone: () => self.ui.phoneNumber(),
    code: () => self.ui.phoneCode({ invalid: invalid === 'code', sentVia }),
    password: () => self.ui.passwordPrompt(invalid === 'password'),
    codeSentCallback: (sentCode) => void (sentVia = sentCode.type),
    invalidCodeCallback: (type) => void (invalid = type),
  };

  try {
    await self.client.start({ ...params, qrCodeHandler, abortSignal: controller.signal });
  } catch (error) {
    if (controller.signal.reason !== 'phone') throw error;
    await self.client.start(params);
  }
  self.secureSession();
};

// A key the form can fix: one Telegram did not accept, unless it came from the environment —
// the form cannot change TUIGRAM_API_ID / TUIGRAM_API_HASH, so that one ends in auth.fail.
/** @param {unknown} error */
const fixable = (error) => self.keyRejected(error) && config.credentials.source !== 'env';

// While Telegram does not accept the key — the shipped one, or one the user gave — ask for theirs
// (an ordinary setup step on screen; the real reason goes only to the log) and sign in again on a
// client built from it, until one works or they quit. Sign-in runs while the tree is still loading,
// so nothing downstream has taken hold of the old client yet. Anything else ends in auth.fail.
/** @param {unknown} error */
const recover = async (error) => {
  /** @type {unknown} */
  let failure = error;
  while (fixable(failure)) {
    console.log(`app key not accepted (${config.credentials.source}): ${Explain.line(failure)}`);
    const invalid = config.credentials.source !== 'shipped';
    await Result.fromPromise(self.client.destroy());
    self.saveCredentials(await self.ui.credentialsForm({ invalid }));
    self.client = self.createClient();
    failure = await attempt().then(
      () => null,
      (next) => next,
    );
  }
  if (failure !== null) auth.fail(failure);
};

// A session that has signed in before keeps its account in storage, readable without the network.
// Not on `logout`: 4-logout.js is already on its way out with the client.
const knownAccount = async () => {
  if (config.cli.command === 'logout') return false;
  const account = await Result.fromPromise(self.client.prepare().then(() => self.client.storage.self.fetch()));
  return account.ok && account.unwrap() !== null;
};

// Checks a known account's session with Telegram while the rest of the app loads and paints:
// mtcute's start() returns at its first getMe when the session is good. Anything else — revoked,
// key not accepted, start() wanting a fresh sign-in (with no QR handler, phone or password it
// throws) — forgets the account and starts over, so the next run takes the blocking path below
// with its screens and recovery. If the account cannot be forgotten, that next run would land
// here again, so it ends in auth.fail instead of a restart loop.
// Either way the returned promise never settles: nothing waiting on the session may run.
/** @returns {Promise<void>} */
const confirm = () =>
  self.client.start({}).then(
    () => self.secureSession(),
    async (error) => {
      console.log(`[auth] stored session not accepted: ${Explain.line(error)}`);
      const forgotten = await Result.fromPromise(self.client.storage.self.store(null));
      if (forgotten.ok) Crash.exit(null, __restartExitCode);
      else auth.fail(error);
      await new Promise(() => {});
    },
  );

// Only the sign-in itself holds up the tree. A known account goes straight on, its session
// confirmed behind it; `ready` is what Telegram calls at startup wait on (start.js).
(async () => {
  if (await knownAccount()) return { ready: confirm() };
  await attempt()
    .catch(recover)
    .finally(() => self.ui.dispose());
  return { ready: Promise.resolve() };
})();
