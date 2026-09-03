/** @type {LayoutSelf['cycleSection']} */
(step) => {
  const index = self.cycle.indexOf(self.selected);
  // The picker is a modal overlay, not part of the cycle — Tab does nothing while it is open.
  if (index === -1) return;
  self.select(self.cycle[(index + step + self.cycle.length) % self.cycle.length]);
};
