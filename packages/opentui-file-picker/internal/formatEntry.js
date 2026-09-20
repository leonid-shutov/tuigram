/**
 * @param {import('./listDirectory.js').FileEntry} entry
 * @returns {string}
 */
export function formatEntry(entry) {
  return entry.isDirectory ? `${entry.name}/` : entry.name;
}
