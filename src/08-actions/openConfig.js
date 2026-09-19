/** @type {(path: string, encoding: BufferEncoding) => string} */
const readSeedFileSync = node.fs.readFileSync;

/** @type {(actual: unknown, expected: unknown) => void} */
const deepStrictEqual = (actual, expected) => node.assert.deepStrictEqual(actual, expected);

/** @type {Actions['openConfig']} */
async () => {
  const { settings, settingsSeed } = config.paths;
  const seeding = !node.fs.existsSync(settings);
  const target = seeding ? settingsSeed : settings;

  const seed = seeding ? config.schema.resolveDefaults() : null;
  if (seeding) Err.risk(node.fs.writeFileSync, settingsSeed, `${JSON.stringify(seed, null, 2)}\n`);

  const [cmd, ...args] = (process.env.VISUAL || process.env.EDITOR || 'vi').split(' ');
  screen.renderer.suspend();
  const { promise, resolve, reject } = Promise.withResolvers();
  node.child_process
    .spawn(cmd, [...args, target], { stdio: 'inherit' })
    .on('exit', resolve)
    .on('error', reject);
  await promise;

  // Only promote the seed to the real file if the editor actually changed it — quitting
  // without saving (or resaving it untouched) leaves it discarded instead of silently
  // materializing that boot's defaults into config.json.
  if (seeding) {
    const [readError, after] = Err.risk(readSeedFileSync, settingsSeed, 'utf8');
    let edited = false;
    if (readError === null) {
      const [parseError, afterParsed] = Err.risk(JSON.parse, after);
      if (parseError !== null) edited = true;
      else {
        const [mismatch] = Err.risk(deepStrictEqual, afterParsed, seed);
        edited = mismatch !== null;
      }
    }
    if (edited) Err.risk(node.fs.renameSync, settingsSeed, settings);
    else Err.risk(node.fs.unlinkSync, settingsSeed);
  }

  config.reload();
  actions.repaintDialogs();
  actions.repaintHints();
  screen.renderer.resume();
};
