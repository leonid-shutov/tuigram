const DEFAULT_MS = 1200;

/** @type {ChatSection['flashStatus']} */
async (status, ms = DEFAULT_MS) => {
  self.setStatus(status);
  const title = self.component.bottomTitle;
  await node.timers.promises.setTimeout(ms, undefined, { ref: false });
  if (self.component.bottomTitle === title) self.setReceipt(store.chat.receipt);
};
