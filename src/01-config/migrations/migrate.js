// There's no `version` field in config.json — see docs/decisions/0001-config-schema-versioning.md
// for why. Each entry here must check for its own old-shape marker and return `source`
// unchanged (same reference) when it isn't there — never assume the input matches the shape
// from right before it. That's what makes replaying this whole list safe against a file in
// ANY actual shape.
/** @type {((source: Record<string, unknown>) => Record<string, unknown>)[]} */
const migrations = [
  // Every migration must follow Fowler's expand/contract discipline: check for its own old-shape
  // marker before transforming, and return the input unchanged (same object reference) when that marker isn't present.
  // Nothing has changed shape yet. Add entries here the day a field is actually
  // renamed/restructured, e.g.:
  // (source) =>
  //   'oldKey' in source && !('newKey' in source)
  //     ? { ...source, oldKey: undefined, newKey: source.oldKey }
  //     : source,
];

/** @type {typeof config.migrations.migrate} */
(source) => {
  let current = source;
  let changed = false;
  for (const up of migrations) {
    const next = up(current);
    if (next !== current) changed = true;
    current = next;
  }
  return { source: current, changed };
};
