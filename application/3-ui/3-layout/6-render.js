(async () => {
  await Promise.all(Object.values(ui.sections).map((section) => section.mount(ui.screen)));
  ui.screen.render();
})();
