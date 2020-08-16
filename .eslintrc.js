module.exports = {
  extends: ["airbnb-typescript/base", "plugin:prettier/recommended"],

  plugins: ["simple-import-sort", "prettier", "jest"],

  rules: {
    "@typescript-eslint/quotes": "off",
    "class-methods-use-this": "off",
    "import/no-cycle": "off",
    "import/prefer-default-export": "off",
    "no-console": "off",
    "no-param-reassign": "off",
    "no-return-assign": "off",
    "no-underscore-dangle": "off",

    "simple-import-sort/sort": [
      "error",
      {
        groups: [
          // Node.js builtins.
          [
            "^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)",
          ],
          // Packages.
          ["^@?\\w"],
          // Paths
          ["^@(src|test)"],
          // Side effect imports.
          ["^\\u0000"],
          // Parent imports. Put `..` last.
          ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
          // Other relative imports. Put same-folder imports and `.` last.
          ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
        ],
      },
    ],
  },

  parserOptions: {
    project: "./tsconfig.json",
  },

  env: {
    "jest/globals": true,
  },
};
