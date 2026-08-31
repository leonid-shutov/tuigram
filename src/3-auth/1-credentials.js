// 0600 on the file — an api_hash is an account-level secret.
/** @param {{ apiId: string, apiHash: string }} credentials */
const save = (credentials) => {
  const json = `${JSON.stringify(credentials, null, 2)}\n`;
  node.fs.writeFileSync(config.paths.credentials, json, { mode: 0o600 });
  config.credentials = credentials;
  return credentials;
};

if (config.credentials.apiId === undefined) self.ui.credentialsForm().then(save);
