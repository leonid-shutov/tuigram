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
      curly: 'off',
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
        Fuzzy: true,

        // config common
        source: true,
        paths: true,
        themes: true,

        // ui common
        theme: true,
        Component: true,
        Box: true,
        Text: true,
        QRCode: true,
        Select: true,
        Textarea: true,
        ScrollBox: true,
        KeyInput: true,
        Media: true,
        Keys: true,
        Input: true,

        // messagePrompt common
        events: true,
        input: true,

        // auth common
        Frame: true,

        // application
        config: true,
        tui: true,
        AbortController: true,
        screen: true,
        auth: true,
        messenger: true,
        ui: true,
      },
    },
  },
  {
    // Entry points are plain CommonJS; prettier formats the repo at 120.
    files: ['tuigram.js', 'bin/**/*.js'],
    rules: {
      'max-len': ['error', { code: 120, ignoreUrls: true }],
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
