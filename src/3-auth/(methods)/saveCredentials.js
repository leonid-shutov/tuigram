// 0600 on the file — an api_hash is an account-level secret.
/** @type {AuthSelf['saveCredentials']} */
(credentials) => {
  const json = `${JSON.stringify(credentials, null, 2)}\n`;
  node.fs.writeFileSync(config.paths.credentials, json, { mode: 0o600 });
  config.credentials = { ...credentials, source: 'file' };
};
