async () => {
  const { TelegramClient } = npm["@mtcute/node"];
  const tg = new TelegramClient({
    apiId: process.env.API_ID,
    apiHash: process.env.API_HASH,
  });
  await tg.start();
  messenger.tg = tg;
};
