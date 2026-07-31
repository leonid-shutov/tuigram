const base = process.env.XDG_CONFIG_HOME ?? node.path.join(node.os.homedir(), '.config');
const pathToConfig = node.path.join(base, 'tuigram', 'config.json');
const [error, file] = Err.risk(node.fs.readFileSync, pathToConfig, 'utf8');
if (error === null) JSON.parse(file);
else ({});
