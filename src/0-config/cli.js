// `bin/tuigram.js` handles --help/--version and exits; the only argument that reaches the
// application is the optional subcommand.
const args = process.argv.slice(2);
({
  command: args.find((arg) => !arg.startsWith('-')) ?? null,
  args,
});
