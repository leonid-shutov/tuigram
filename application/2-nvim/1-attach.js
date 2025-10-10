(async () => {
  const { findNvim, attach } = npm.neovim;
  const found = findNvim({ orderBy: "desc", minVersion: "0.9.0" });
  const path = found.matches[0].path;
  const nvimProc = node.child_process.spawn(path, ["--embed"]);
  const client = attach({ proc: nvimProc, logger: console });
  await client.uiAttach(80, 24, {});

  nvim.client = client;
})();
