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
        Preview: true,
        Err: true,
        Message: true,
        Dialog: true,
        AsyncIterator: true,
        Fuzzy: true,
        Hash: true,

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
        Emoji: true,
        Option: true,
        Keys: true,
        Input: true,

        // auth common
        Frame: true,

        // chat common
        Bubble: true,
        Picture: true,

        // application
        config: true,
        tui: true,
        AbortController: true,
        screen: true,
        auth: true,
        messenger: true,
        store: true,
        ui: true,
        navigation: true,
        actions: true,
      },
    },
  },
  {
    // The entry point is plain CommonJS; prettier formats the repo at 120.
    files: ['bin/**/*.js'],
    rules: {
      'max-len': ['error', { code: 120, ignoreUrls: true }],
    },
  },
  {
    // Plain CommonJS; the fake client mirrors mtcute's own API names.
    files: ['demo/**/*.js'],
    rules: {
      'max-len': ['error', { code: 120, ignoreUrls: true }],
      camelcase: 'off',
      'class-methods-use-this': 'off',
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
