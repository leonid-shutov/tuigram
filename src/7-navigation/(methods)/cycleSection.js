/** @type {Navigation['cycleSection']} */
(step) => {
  const index = navigation.cycle.indexOf(navigation.selected);
  if (index === -1) return;
  navigation.select(navigation.cycle[(index + step + navigation.cycle.length) % navigation.cycle.length]);
};
