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
        Result: true,
        Crash: true,
        Explain: true,
        Message: true,
        Dialog: true,
        AsyncIterator: true,
        isThenable: true,
        Fuzzy: true,
        Hash: true,
        Link: true,
        Version: true,
        Fetch: true,
        Engines: true,

        // Update common
        Update: true,
        Source: true,

        // config common
        source: true,
        paths: true,
        themes: true,
        defaults: true,
        schema: true,
        migrate: true,
        resolveConfig: true,
        resolveTheme: true,

        // ui common
        theme: true,
        Component: true,
        Box: true,
        Text: true,
        QRCode: true,
        FilePicker: true,
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
        crashReport: true,
        Channel: true,
        packageVersion: true,
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
    // A standalone package: real ESM imports, no injected globals.
    files: ['packages/**/*.js'],
    rules: {
      'max-len': ['error', { code: 120, ignoreUrls: true }],
      'no-nested-ternary': 'off',
      camelcase: 'off',
      'new-cap': 'off',
      curly: 'off',
    },
    languageOptions: {
      sourceType: 'module',
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
