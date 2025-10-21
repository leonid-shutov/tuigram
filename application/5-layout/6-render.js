(async () => {
  await Promise.all(
    Object.values(sections).map((section) => section.mount(screen)),
  );
  screen.render();
})();
