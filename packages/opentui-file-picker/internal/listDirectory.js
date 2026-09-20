import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * @typedef {object} FileEntry
 * @property {string} name
 * @property {boolean} isDirectory
 */

/**
 * Reads one directory, synchronously.
 *
 * @param {string} dir absolute path, already resolved
 * @param {(entry: { name: string; isDirectory: boolean }) => boolean} [filterPredicate] applied
 *   to files only — directories always pass, so a filtered file type stays reachable by navigation
 * @returns {FileEntry[]} `..` first when `dir` is not the filesystem root, then directories, then
 *   files, each group sorted by name
 */
export function listDirectory(dir, filterPredicate) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });

  /** @type {FileEntry[]} */
  const entries = [];
  for (const dirent of dirents) {
    const isDirectory = dirent.isDirectory();
    if (!isDirectory && typeof filterPredicate === 'function' && !filterPredicate({ name: dirent.name, isDirectory })) {
      continue;
    }

    entries.push({ name: dirent.name, isDirectory });
  }

  entries.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  if (path.parse(dir).root !== dir) {
    entries.unshift({ name: '..', isDirectory: true });
  }

  return entries;
}
