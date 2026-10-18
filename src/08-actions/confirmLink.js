// The host is bold and starts the line, so where the link goes reads at a glance however long the
// rest is. A link whose text is not its URL shows that text first, and then where it really goes,
// since the text can claim anything.
/** @type {Actions['confirmLink']} */
({ label, url }) => {
  const { muted, link } = config.theme;
  const target = new node.url.URL(url);
  const scheme = target.protocol === 'https:' ? '' : `${target.protocol}//`;
  const path = target.href.slice(target.origin.length);
  ui.choice.open({
    title: ' Open link? ',
    message: '',
    body: new tui.StyledText([
      tui.fg(muted)(url.includes(label) ? scheme : `“${Cells.ellipsize(label, 60)}”\n→ ${scheme}`),
      tui.bold(tui.fg(link)(target.host)),
      tui.fg(muted)(path === '/' ? '' : path),
    ]),
    options: [
      { name: 'Open in browser', value: 'open' },
      { name: 'Copy link', value: 'copy' },
    ],
    /** @param {'open' | 'copy'} choice */
    onPick: (choice) => {
      navigation.select('chat');
      if (choice === 'open') return void OS.open(url);
      if (!screen.renderer.isOsc52Supported()) return void ui.chat.flashStatus('clipboard unsupported');
      screen.renderer.copyToClipboardOSC52(url);
      ui.chat.flashStatus('link copied');
    },
  });
  navigation.select('choice');
};
