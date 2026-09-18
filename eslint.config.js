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
        Link: true,

        // config common
        source: true,
        paths: true,
        themes: true,
        defaults: true,

        // ui common
        theme: true,
        Component: true,
        Box: true,
        Text: true,
        QRCode: true,
        Select: true,
        Textarea: true,
        ScrollBox: true,
        Media: true,
        Emoji: true,
        Option: true,
        Input: true,

        // OS common
        spawnDetached: true,

        // auth common
        Frame: true,

        // chat common
        Bubble: true,
        Picture: true,

        // keymap common
        Binding: true,

        // application
        config: true,
        tui: true,
        Keymap: true,
        AbortController: true,
        URL: true,
        screen: true,
        auth: true,
        messenger: true,
        store: true,
        ui: true,
        navigation: true,
        actions: true,
        keymap: true,
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
    files: ['playground/**/*.js'],
    rules: {
      'max-len': ['error', { code: 120, ignoreUrls: true }],
      'no-nested-ternary': 'off',
      camelcase: 'off',
      'new-cap': 'off',
    },
  },
];
