// The same screen whenever a key is needed — no key yet, or one Telegram did not accept — and
// worded as an ordinary setup step: the user never needs to know why it appeared.
const INSTRUCTIONS = [
  'To sign you in, tuigram needs a free Telegram API key.',
  'It takes about a minute:',
  '',
  '  1. open  https://my.telegram.org  and log in',
  '  2. choose "API development tools"',
  '  3. fill in any app title and short name, e.g. "tuigram"',
  '  4. copy the api_id and api_hash shown on the next page',
  '',
  'Keep them to yourself, like a password.',
];

const INVALID = 'That api_id / api_hash did not work — check them and try again.';

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
({ invalid }) =>
  new Promise((resolve) => {
    const fields = [Field('api_id, e.g. 1234567'), Field('api_hash, 32 hex characters')];
    // Only for a key the user typed themselves, as phoneCode does for a wrong code.
    const hint = invalid ? [Text({ content: INVALID, fg: config.theme.accent, marginBottom: 1 })] : [];

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
      title: 'One-time setup',
      children: [
        ...hint,
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
      if (event.name === 'return') {
        const [apiId, apiHash] = fields.map((field) => field.value.trim());
        if (apiId !== '' && apiHash !== '') resolve({ apiId, apiHash });
      } else if (event.name === 'tab') focus(index + (event.shift ? -1 : 1));
      else if (event.name === 'down') focus(index + 1);
      else if (event.name === 'up') focus(index - 1);
    });

    focus(0);
  });
