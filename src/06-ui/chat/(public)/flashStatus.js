const DEFAULT_MS = 1200;

/** @type {ChatSection['flashStatus']} */
async (status, ms = DEFAULT_MS) => {
  self.setStatus(status);
  await node.timers.promises.setTimeout(ms, undefined, { ref: false });
  if (self.component.getTitlePart('status') === status) self.setReceipt(store.chat.receipt);
};
