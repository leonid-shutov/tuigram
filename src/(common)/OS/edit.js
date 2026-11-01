/** @type {typeof OS.edit} */
(path) => {
  const fallback = process.platform === 'win32' ? 'notepad' : 'vi';
  const [cmd, ...args] = (process.env.VISUAL || process.env.EDITOR || fallback).split(' ');
  return OS.run(cmd, [...args, path]);
};
