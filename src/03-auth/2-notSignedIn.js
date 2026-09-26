if (config.cli.command === 'logout' && !node.fs.existsSync(config.paths.session)) Crash.exit('not signed in', 0);
