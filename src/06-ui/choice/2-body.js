// Word wrap still breaks a run with no spaces, like a long URL, where it has to.
Text({ content: '', visible: false, maxHeight: 8, marginX: 1, marginBottom: 1, wrapMode: 'word', fg: config.theme.fg });
