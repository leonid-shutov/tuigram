const { TelegramClient } = npm['@mtcute/bun'];
const { API_ID, API_HASH } = process.env;
const tg = new TelegramClient({ apiId: API_ID, apiHash: API_HASH });
tg.start().then(() => tg);
