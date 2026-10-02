/** @param {any} error */
const explain = (error) => {
  // Only a key from the environment gets here; one from the form or credentials.json is asked for
  // again instead (5-signIn.js).
  const badCredentials = `Telegram did not accept TUIGRAM_API_ID / TUIGRAM_API_HASH.
Check them at https://my.telegram.org.`;

  /** @type {Record<string, string | undefined>} */
  const messages = {
    API_ID_INVALID: badCredentials,
    API_ID_PUBLISHED_FLOOD: badCredentials,
    CONNECTION_API_ID_INVALID: badCredentials,
    PHONE_NUMBER_INVALID: 'That phone number is not a valid Telegram account.',
    PHONE_NUMBER_BANNED: 'That phone number is banned from Telegram.',
    AUTH_KEY_UNREGISTERED: 'The stored session is no longer valid. Run `tuigram logout` and sign in again.',
  };
  return messages[error?.text] ?? error?.message ?? String(error);
};

/** @type {AuthSelf['fail']} */
(error) => Crash.exit(explain(error), 1);
