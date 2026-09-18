const configured = source.imageProtocol;

defaults.imageProtocols.some((protocol) => protocol === configured) ? configured : 'auto';
