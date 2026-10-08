// The first page lands under whatever arrived while it was in flight: a live message, or a send
// still pending. The page goes first, and a held entry survives only if the page lacks it — so a
// message delivered both ways is held once, and late arrivals stay below the history.
/** @type {ChatStore['seed']} */
(page) => {
  const inPage = new Set(page.map(({ id }) => id));
  self.messages = [...page, ...self.messages.filter(({ id }) => !inPage.has(id))];
};
