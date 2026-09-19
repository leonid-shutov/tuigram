/** @type {(path: string, encoding: BufferEncoding) => string} */
const readFileSync = node.fs.readFileSync;

/** @type {typeof config.schema.resolveConfig} */
() => {
  const { settings, settingsBackup } = config.paths;
  const [readError, file] = Err.risk(readFileSync, settings, 'utf8');

  /** @type {Record<string, unknown>} */
  let parsed = {};
  if (readError === null) {
    const [parseError, result] = Err.risk(JSON.parse, file);
    if (parseError === null) parsed = result;
    else console.log(`[config] failed to parse ${settings}: ${parseError.message}, using defaults`);
  }

  const { source: migrated, changed } = config.migrations.migrate(parsed);

  // Only touches disk when a migration actually transformed something — a typo the checks
  // below reject stays visible in the file to fix, and a file needing no migration is never
  // rewritten at all.
  if (readError === null && changed) {
    Err.risk(node.fs.copyFileSync, settings, settingsBackup);
    const json = `${JSON.stringify(migrated, null, 2)}\n`;
    Err.risk(node.fs.writeFileSync, settings, json);
  }

  const sanitized = { ...migrated };
  for (const key of Object.keys(sanitized)) {
    if (!config.schema.isSchemaKey(key)) {
      console.log(`[config] unknown key "${key}" in ${settings}, ignored`);
      continue;
    }
    const field = config.schema.fields[key];
    if (!field.validate(sanitized[key])) {
      console.log(`[config] invalid value for "${key}" in ${settings}, using default`);
      delete sanitized[key];
    }
  }

  return sanitized;
};
