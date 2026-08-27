const { ErrorCorrectionLevel } = npm['@opentui/qrcode'];

/** @type {AuthUiModule['qrLogin']} */
(onPhone) => {
  /** @type {AuthScreenHandle | null} */
  let handle = null;
  /** @type {import('@opentui/qrcode').QRCodeRenderable | null} */
  let code = null;
  /** @type {import('@opentui/core').TextRenderable | null} */
  let link = null;

  const mount = () => {
    code = QRCode({
      content: '',
      errorCorrectionLevel: ErrorCorrectionLevel.L,
      fallbackContent: 'Resize terminal to see QR code',
      fallbackColor: config.theme.muted,
    });
    link = Text({ content: '', fg: config.theme.muted, wrapMode: 'char' });

    handle = self.mount({
      title: 'Sign in to Telegram',
      children: [
        Text({ content: 'Telegram → Settings → Devices → Link Desktop Device', fg: config.theme.fg }),
        code,
        link,
        Text({ content: 'p: sign in with a phone number instead   Ctrl-C: quit', fg: config.theme.muted }),
      ],
    });

    handle.onKey((event) => {
      if (event.name === 'p') onPhone();
    });
  };

  return (url) => {
    if (handle === null) mount();
    if (code !== null) code.content = url;
    if (link !== null) link.content = url;
    handle?.render();
  };
};
