const { getBasicPeerType } = npm['@mtcute/node'];

/** @type {MessengerModule['isChannel']} */
(chatId) => getBasicPeerType(chatId) === 'channel';
