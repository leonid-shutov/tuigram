// A raw mtcute stack behind a half-torn-down renderer is unreadable. Give the terminal back
// first, then say what to do about it.
/** @param {any} error */
const explain = (error) => {
  /** @type {Record<string, string | undefined>} */
  const messages = {
    API_ID_INVALID: `Telegram rejected the api_id / api_hash pair. Check them at https://my.telegram.org,
then edit or delete ${config.paths.credentials} and start tuigram again.`,
    PHONE_NUMBER_INVALID: 'That phone number is not a valid Telegram account.',
    PHONE_NUMBER_BANNED: 'That phone number is banned from Telegram.',
    AUTH_KEY_UNREGISTERED: 'The stored session is no longer valid. Run `tuigram logout` and sign in again.',
  };
  return messages[error?.text] ?? error?.message ?? String(error);
};

/** @type {AuthSelf['fail']} */
(error) => self.exit(explain(error), 1);
