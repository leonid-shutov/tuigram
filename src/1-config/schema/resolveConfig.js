/** @type {typeof config.schema.resolveConfig} */
() => {
  const { settings, settingsBackup } = config.paths;
  const read = Result.from(() => node.fs.readFileSync(settings, 'utf8'));

  /** @type {Record<string, unknown>} */
  let parsed = {};
  if (read.ok) {
    const parseResult = Result.from(() => JSON.parse(read.unwrap()));
    if (parseResult.ok) parsed = parseResult.unwrap();
    else {
      const reason = parseResult.error instanceof Error ? parseResult.error.message : String(parseResult.error);
      console.log(`[config] failed to parse ${settings}: ${reason}, using defaults`);
    }
  }

  const { source: migrated, changed } = config.migrations.migrate(parsed);

  // Only touches disk when a migration actually transformed something — a typo the checks
  // below reject stays visible in the file to fix, and a file needing no migration is never
  // rewritten at all.
  if (read.ok && changed) {
    Result.from(() => node.fs.copyFileSync(settings, settingsBackup));
    const json = `${JSON.stringify(migrated, null, 2)}\n`;
    Result.from(() => node.fs.writeFileSync(settings, json));
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
