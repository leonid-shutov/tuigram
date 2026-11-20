'use strict';

const { spawnSync } = require('child_process');
const channel = require('./channel');

// Both ways to upgrade run here, in bin/tuigram.js's own process and never in the app's: the
// `upgrade` subcommand, and shift+u, which the app hands back to it (UPGRADE in ./context). That
// process has loaded no DLL or addon from the install being replaced -- on Windows, a loaded one
// can't be deleted, so npm would leave the old copy behind in node_modules\.tuigram-<random>.
/** @param {string} rootDir @param {string} version @returns {number} the exit status */
const upgrade = (rootDir, version) => {
  const plan = channel.upgradePlan(rootDir, version);
  if (plan === null) {
    process.stderr.write('tuigram: could not tell how this copy was installed\n');
    return 1;
  }
  // Empty steps (aur): nothing here can run itself, and an empty loop would silently exit 0
  // having done nothing.
  if (plan.steps.length === 0) {
    process.stderr.write(`tuigram: ${plan.manualCommand}\n`);
    return 1;
  }
  for (const step of plan.steps) {
    const { status, error } = spawnSync(step.cmd, step.args, { stdio: 'inherit' });
    if (error) process.stderr.write(`tuigram: ${step.cmd}: ${error.message}\n`);
    if (status !== 0) return status ?? 1;
  }
  return 0;
};

module.exports = { upgrade };
