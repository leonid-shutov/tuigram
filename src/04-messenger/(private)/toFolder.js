const { getMarkedPeerId } = npm['@mtcute/node'];

// A folder holding Saved Messages lists it as `inputPeerSelf`, which carries no id for
// getMarkedPeerId to read (it throws); its chat id is the account's own user id.
/** @param {import('@mtcute/node').tl.TypeInputPeer} peer @returns {number[]} */
const chatIdOf = (peer) => {
  if (peer._ !== 'inputPeerSelf') return [getMarkedPeerId(peer)];
  const me = messenger.tg.storage.self.getCached();
  return me === null ? [] : [me.userId];
};

/** @param {import('@mtcute/node').tl.TypeInputPeer[]} peers */
const chatIds = (peers) => peers.flatMap(chatIdOf);

// Switches on the TL constructor name: `instanceof` never holds across the sandbox's realm.
/** @type {MessengerSelf['toFolder']} */
(filter) => {
  if (filter._ === 'dialogFilterDefault') return Folder.ALL;

  const base = {
    id: filter.id,
    title: filter.title.text,
    pinnedIds: chatIds(filter.pinnedPeers),
    includeIds: new Set(chatIds(filter.includePeers)),
  };

  if (filter._ === 'dialogFilterChatlist') {
    return { ...base, isChatlist: true, excludeIds: new Set(), rules: { ...Folder.ALL.rules } };
  }

  return {
    ...base,
    isChatlist: false,
    excludeIds: new Set(chatIds(filter.excludePeers)),
    rules: {
      contacts: filter.contacts ?? false,
      nonContacts: filter.nonContacts ?? false,
      groups: filter.groups ?? false,
      broadcasts: filter.broadcasts ?? false,
      bots: filter.bots ?? false,
      excludeMuted: filter.excludeMuted ?? false,
      excludeRead: filter.excludeRead ?? false,
      excludeArchived: filter.excludeArchived ?? false,
    },
  };
};
