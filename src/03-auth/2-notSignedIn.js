if (config.cli.command === 'logout' && !node.fs.existsSync(config.paths.session)) auth.exit('not signed in', 0);
