/** @param {any} error */
const explain = (error) => {
  const badCredentials = `Telegram rejected the api_id / api_hash pair. Check them at https://my.telegram.org,
then edit or delete ${config.paths.credentials} and start tuigram again.`;

  /** @type {Record<string, string | undefined>} */
  const messages = {
    API_ID_INVALID: badCredentials,
    CONNECTION_API_ID_INVALID: badCredentials,
    PHONE_NUMBER_INVALID: 'That phone number is not a valid Telegram account.',
    PHONE_NUMBER_BANNED: 'That phone number is banned from Telegram.',
    AUTH_KEY_UNREGISTERED: 'The stored session is no longer valid. Run `tuigram logout` and sign in again.',
  };
  return messages[error?.text] ?? error?.message ?? String(error);
};

/** @type {AuthSelf['fail']} */
(error) => auth.exit(explain(error), 1);
