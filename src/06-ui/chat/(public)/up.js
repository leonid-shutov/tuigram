// How close to the oldest loaded message `up` starts fetching the next page: enough messages to
// keep a held key busy for one round trip, so scrolling never stalls at the top.
const PREFETCH_MARGIN = 15;

/** @type {ChatSection['up']} */
(count = 1) => {
  if (self.selectedIndex <= 0) return void self.emit('reachTop');
  self.selectAt(self.selectedIndex - count);
  if (self.selectedIndex < PREFETCH_MARGIN) self.emit('reachTop');
};
