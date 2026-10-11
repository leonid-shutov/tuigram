const splash = Text({ content: 'Connecting to Telegram…', fg: config.theme.muted });
screen.wrapper.add(splash);

// Painted before the tree goes on: 03-auth loads mtcute synchronously, which would hold this
// frame back until it is done.
screen.renderer.requestRender();
screen.renderer.idle().then(() => splash);
