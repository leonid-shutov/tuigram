// `bin/tuigram.js` handles --help/--version and exits; only the subcommand reaches here.
const args = process.argv.slice(2);
({
  command: args.find((arg) => !arg.startsWith('-')) ?? null,
  args,
});
