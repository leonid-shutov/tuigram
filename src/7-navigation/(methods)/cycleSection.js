/** @type {Navigation['cycleSection']} */
(step) => {
  const index = navigation.cycle.indexOf(navigation.selected);
  // The picker is a modal overlay, not part of the cycle — Tab does nothing while it is open.
  if (index === -1) return;
  navigation.select(navigation.cycle[(index + step + navigation.cycle.length) % navigation.cycle.length]);
};
