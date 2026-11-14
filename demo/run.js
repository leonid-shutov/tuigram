'use strict';

// The real tuigram, in this terminal, on the made-up account in demo/fixtures.js: for the README
// screenshot. `npm run demo`; quit as usual.
//
// The real world (bin/world.js), with the tests' fake Telegram (test/telegram.js) for its
// `telegram`. A fresh home under the temp dir keeps your config, session and emojis out of it.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { run } = require('../bin/app.js');
const { createAccount } = require('./account.js');

const write = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value));
};

void (async () => {
  // The GIF's scene (demo/scene.js) holds back the lines it plays live; `npm run demo` alone has
  // every line in place and nobody answering.
  const scene = process.env.TUIGRAM_DEMO_SCENE ? require('./scene.js') : null;

  // The account first: it needs no home, so nothing is left behind if building it fails.
  const { telegram, emojis, people, chats } = await createAccount({ withhold: scene?.withhold });

  // A home of its own: the app reads every directory from XDG_*, and never needs a key from the user.
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tuigram-demo-'));
  Object.assign(process.env, {
    XDG_CONFIG_HOME: path.join(home, 'config'),
    XDG_DATA_HOME: path.join(home, 'data'),
    XDG_STATE_HOME: path.join(home, 'state'),
    XDG_CACHE_HOME: path.join(home, 'cache'),
    TUIGRAM_API_ID: '1',
    TUIGRAM_API_HASH: 'demo',
  });
  // No update check: it is the app's only use of the network. A plain ✓ heads the unread bar
  // beside the account's messages, rather than the default 🙈.
  write(path.join(home, 'config', 'tuigram', 'config.json'), { updateCheck: false, receipt: 'tick' });
  write(path.join(home, 'data', 'tuigram', 'emojis.json'), emojis);

  process.on('exit', (code) => {
    for (const method of telegram.unanswered) {
      process.stderr.write(`demo: the fake Telegram has no answer for ${method}\n`);
    }
    // A crash keeps the home: its report points at the log in there.
    if (code === 0) fs.rmSync(home, { recursive: true, force: true });
  });

  scene?.play({ telegram, people, chats, home });

  await run({ telegram: telegram.facet });
})();
