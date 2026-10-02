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

attempt()
  .catch(recover)
  .finally(() => self.ui.dispose());
