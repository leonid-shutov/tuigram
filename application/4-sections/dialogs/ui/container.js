() =>
  blessed.box({
    height: screen.height - 2 - ((screen.height - 2) % 4) + 2,
    left: 0,
    bottom: 0,
    width: "30%",
    border: "line",
    focusable: true,
  });
