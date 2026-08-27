const { ErrorCorrectionLevel } = npm['@opentui/qrcode'];

(onPhone) => {
  let handle = null;
  let code = null;
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
    code.content = url;
    link.content = url;
    handle.render();
  };
};
