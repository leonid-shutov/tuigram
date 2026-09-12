// QR sign-in is primary; `p` on the QR screen aborts it and falls back to phone + code.
// Every callback here exists to keep mtcute off stdin and off `console` — its defaults
// (`node:readline`, `console.log`) would fight the renderer.
(async () => {
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
    await auth.client.start({ ...params, qrCodeHandler, abortSignal: controller.signal });
  } catch (error) {
    if (controller.signal.reason !== 'phone') auth.fail(error);
    else {
      await auth.client.start(params);
      auth.secureSession();
    }
  } finally {
    self.ui.dispose();
  }
})();
