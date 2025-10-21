nvim.on("mode", (mode) => {
  if (mode === "normal") layout.selectable = true;
  else layout.selectable = false;
});

screen.on("keypress", (ch) => {
  if (module.reserved.includes(ch)) return;
});
