'use strict';

const init = require('eslint-config-metarhia');

module.exports = [
  ...init,
  {
    files: ['src/**/*.js'],
    rules: {
      strict: 'off',
      'max-len': ['error', { code: 120, ignoreUrls: true }],
      'no-nested-ternary': 'off',
      camelcase: 'off',
      'new-cap': 'off',
    },
    languageOptions: {
      sourceType: 'module',
      globals: {
        // uncommonjs
        node: true,
        npm: true,
        self: true,
        __rootDir: true,

        // common
        Obj: true,
        Rate: true,
        Random: true,
        OS: true,
        LinkedList: true,
        LinkedDialogs: true,
        Err: true,
        Message: true,
        Dialog: true,
        AsyncIterator: true,

        // config common
        source: true,

        // ui common
        theme: true,
        Box: true,
        Text: true,
        Select: true,
        Textarea: true,
        ScrollBox: true,
        KeyInput: true,
        Keys: true,

        // application
        config: true,
        tui: true,
        messenger: true,
        nvim: true,
        ui: true,
      },
    },
  },
  {
    files: ['playground/**/*.js'],
    rules: {
      'max-len': ['error', { code: 120, ignoreUrls: true }],
      'no-nested-ternary': 'off',
      camelcase: 'off',
      'new-cap': 'off',
    },
  },
];
