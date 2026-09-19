/** @type {(actual: unknown, expected: unknown) => void} */
const deepStrictEqual = (actual, expected) => node.assert.deepStrictEqual(actual, expected);

/** @param {string} cmd @param {string[]} args */
const spawnEditor = (cmd, args) => {
  const { promise, resolve, reject } = Promise.withResolvers();
  node.child_process.spawn(cmd, args, { stdio: 'inherit' }).on('exit', resolve).on('error', reject);
  return promise;
};

/** @type {Actions['openConfig']} */
async () => {
  const { settings, settingsSeed } = config.paths;
  const seeding = !node.fs.existsSync(settings);
  const target = seeding ? settingsSeed : settings;

  const seed = seeding ? config.schema.resolveDefaults() : null;
  if (seeding) Result.from(() => node.fs.writeFileSync(settingsSeed, `${JSON.stringify(seed, null, 2)}\n`));

  const [cmd, ...args] = (process.env.VISUAL || process.env.EDITOR || 'vi').split(' ');
  screen.renderer.suspend();
  const ran = await Result.fromPromise(spawnEditor(cmd, [...args, target]));

  // Only promote the seed to the real file if the editor actually changed it — quitting
  // without saving (or resaving it untouched) leaves it discarded instead of silently
  // materializing that boot's defaults into config.json.
  if (ran.ok && seeding) {
    const read = Result.from(() => node.fs.readFileSync(settingsSeed, 'utf8'));
    let edited = false;
    if (read.ok) {
      const parsed = Result.from(() => JSON.parse(read.unwrap()));
      if (!parsed.ok) edited = true;
      else edited = !Result.from(() => deepStrictEqual(parsed.unwrap(), seed)).ok;
    }
    if (edited) Result.from(() => node.fs.renameSync(settingsSeed, settings));
    else Result.from(() => node.fs.unlinkSync(settingsSeed));
  }

  config.reload();
  actions.repaintDialogs();
  actions.repaintHints();
  screen.renderer.resume();
  if (!ran.ok) ui.errors.report('Could not open the editor.', ran.error);
};
