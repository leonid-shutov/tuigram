const [error, file] = Err.risk(node.fs.readFileSync, paths.settings, 'utf8');
if (error === null) JSON.parse(file);
else ({});
