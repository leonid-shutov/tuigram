const INSTRUCTIONS = [
  'tuigram needs your own Telegram API credentials.',
  '',
  '  1. open  https://my.telegram.org  and log in',
  '  2. choose "API development tools" and create an app',
  '  3. copy the api_id and api_hash it shows you',
  '',
  'The pair identifies you personally — do not share it.',
];

/** @param {string} placeholder */
const Field = (placeholder) =>
  Input({
    width: 46,
    marginBottom: 1,
    placeholder,
    placeholderColor: config.theme.muted,
    backgroundColor: config.theme.surface,
    focusedBackgroundColor: config.theme.selection,
    textColor: config.theme.fg,
    focusedTextColor: config.theme.fg,
    cursorColor: config.theme.accent,
  });

/** @param {string} content */
const Label = (content) => Text({ content, fg: config.theme.accent });

/** @type {AuthUiModule['credentialsForm']} */
() =>
  new Promise((resolve) => {
    const fields = [Field('api_id, e.g. 1234567'), Field('api_hash, 32 hex characters')];

    let index = 0;
    /** @param {number} next */
    const focus = (next) => {
      index = (next + fields.length) % fields.length;
      for (const [i, input] of fields.entries()) {
        if (i === index) input.focus();
        else input.blur();
      }
    };

    const handle = self.mount({
      title: 'Telegram API credentials',
      children: [
        Text({ content: INSTRUCTIONS.join('\n'), fg: config.theme.fg }),
        Text({ content: '', fg: config.theme.muted }),
        Label('api_id'),
        fields[0],
        Label('api_hash'),
        fields[1],
        Text({ content: 'Tab: next field   Enter: continue   Ctrl-C: quit', fg: config.theme.muted }),
      ],
    });

    handle.onKey((event) => {
      if (event.name === 'return') resolve({ apiId: fields[0].value, apiHash: fields[1].value });
      else if (event.name === 'tab') focus(index + (event.shift ? -1 : 1));
      else if (event.name === 'down') focus(index + 1);
      else if (event.name === 'up') focus(index - 1);
    });

    focus(0);
  });
