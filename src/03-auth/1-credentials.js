// Only when no key came from anywhere — env, credentials.json, or the one shipped in the tarball.
if (config.credentials.source === undefined) self.ui.credentialsForm({ invalid: false }).then(self.saveCredentials);
