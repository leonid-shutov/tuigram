'use strict';

const init = require('eslint-config-metarhia');

module.exports = [
  ...init,
  {
    files: ['application/**/*.js'],
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
        $: true,
        __rootDir: true,

        // common
        Obj: true,
        Time: true,
        LinkedList: true,
        risk: true,
        riskAsync: true,

        // application
        tui: true,
        messenger: true,
        nvim: true,
        ui: true,
      },
    },
  },
];
