// The Bahasa Melayu table lives in ms.json, so the type checker can read its keys: they are
// the English labels, and Locale.Label is exactly that set (types/global.ts). See t.js.
// TODO: uncommonjs should handle .json files itself (load ms.json as Locale.ms), making this file unnecessary.
JSON.parse(node.fs.readFileSync(node.path.join(__rootDir, 'src/(common)/Locale/ms.json'), 'utf8'));
