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
        LinkedList: true,
        risk: true,
        riskAsync: true,
        Message: true,
        AsyncIterator: true,

        // application
        tui: true,
        messenger: true,
        nvim: true,
        ui: true,
      },
    },
  },
];
