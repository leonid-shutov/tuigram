/** @type {Actions['upgrade']} */
async () => {
  const release = store.update.available;
  if (release === null) return;
  const plan = Update.upgradePlan(release);
  if (plan === null) return;

  // Empty steps (aur) means there is nothing here that can run itself -- only pacman's own
  // helper should touch those files, so this is unconditional, unlike the writable() check
  // below, and unprefixed with sudo since plan.manualCommand already names the whole command.
  if (plan.steps.length === 0) {
    console.log(`[update] manual only: ${plan.manualCommand}`);
    ui.errors.report(`Run: ${plan.manualCommand}`, new Error('this install channel has no automatic upgrade'));
    return;
  }

  // npm install -g only *warns* on EBADENGINE without --engine-strict, so without this check the
  // upgrade would succeed and tuigram would then refuse to boot. Leave the bar showing.
  if (Update.blockedByNode(release)) {
    const blocked = `${release.version} needs Node ${release.minNode} (you have ${process.versions.node})`;
    ui.errors.report(blocked, new Error('running Node is older than the update requires'));
    return;
  }

  if (!Channel.writable(plan)) {
    const manual = `sudo ${plan.manualCommand}`;
    console.log(`[update] not writable: ${plan.prefix}; run: ${manual}`);
    ui.errors.report(`Run: ${manual}`, new Error('npm global prefix is not writable'));
    return;
  }

  screen.renderer.suspend();
  process.stderr.write(`\ntuigram: updating ${packageVersion} -> ${release.version}\n\n`);

  /** @type {Result<number | null>} */
  let ran = Result.from(() => 0);
  for (const step of plan.steps) {
    ran = await Result.fromPromise(OS.run(step.cmd, step.args));
    if (!ran.ok || ran.unwrap() !== 0) break;
  }

  if (ran.ok && ran.unwrap() === 0) {
    Crash.exit(`updated to ${release.version}; start tuigram again`, 0);
    return;
  }

  actions.repaintDialogs();
  actions.repaintHints();
  screen.renderer.resume();
  ui.errors.report(
    ran.ok ? `Update failed (exit ${ran.unwrap()}).` : 'Update failed.',
    ran.ok ? new Error(`exit ${ran.unwrap()}`) : ran.error,
  );
};
