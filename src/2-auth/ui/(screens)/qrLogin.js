// The QR sign-in screen. Mounted lazily on the first token: `tg.start()` returns without
// calling `qrCodeHandler` at all when the stored session is still valid, and a warm start
// must not flash a panel. The token rotates before it expires, so `update` is called
// repeatedly and re-renders in place.
const { ErrorCorrectionLevel } = npm['@opentui/qrcode'];

(onPhone) => {
  let handle = null;
  let code = null;
  let link = null;

  const mount = () => {
    // QRCodeRenderable defaults to black-on-white already, which is what scanning needs
    // regardless of terminal theme.
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
    code.content = url;
    link.content = url;
    handle.render();
  };
};
