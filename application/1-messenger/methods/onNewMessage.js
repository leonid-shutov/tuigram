(handler) =>
  $.dispatcher.onNewMessage((ctx) => {
    console.log({ ctx });
  });
