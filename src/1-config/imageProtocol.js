// 'auto' picks the best the terminal offers
const protocols = ['auto', 'kitty', 'sixel', 'blocks', 'off'];
const configured = source.imageProtocol;

protocols.some((protocol) => protocol === configured) ? configured : 'auto';
