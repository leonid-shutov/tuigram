/** @type {Actions['viewSelected']} */
async () => {
  const message = ui.chat.selectedMessage;
  if (message === null) return;
  if (message.text === '') return void ui.chat.flashStatus(Locale.t('no text'));

  const dir = node.fs.mkdtempSync(node.path.join(node.os.tmpdir(), 'tuigram-'));
  const file = node.path.join(dir, `message-${message.id}.txt`);
  node.fs.writeFileSync(file, message.text.endsWith('\n') ? message.text : `${message.text}\n`, { mode: 0o444 });

  await screen.renderer.suspend();
  const ran = await Result.fromPromise(OS.edit(file));
  Result.from(() => node.fs.rmSync(dir, { recursive: true, force: true }));
  await screen.renderer.resume();
  if (!ran.ok) ui.errors.report(Locale.t('Could not open the editor.'), ran.error);
};
