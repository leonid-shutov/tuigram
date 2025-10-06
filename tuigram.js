const uncommonjs = require("@leonid-shutov/uncommonjs");
const blessed = require("blessed");

process.on("unhandledRejection", (reason, promise) => {
  console.dir({ promise });
  console.dir({ reason });
});

(async () => {
  await uncommonjs.loadApplication({
    console,
    blessed,
    process,
  });
})();
