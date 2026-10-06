/** @type {typeof Arr.keyBy} */
(key, items) => new Map(items.map((item) => [item[key], item]));
