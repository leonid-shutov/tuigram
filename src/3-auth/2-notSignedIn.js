if (config.cli.command === 'logout' && !node.fs.existsSync(config.paths.session)) self.exit('not signed in', 0);
