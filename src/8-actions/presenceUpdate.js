/** @type {Actions['presenceUpdate']} */
(userId, presence) => {
  store.peers.setPresence(userId, presence);
};
