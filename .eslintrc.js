module.exports = {
  extends: ["airbnb-typescript/base", "plugin:prettier/recommended"],

  plugins: ["simple-import-sort", "prettier", "jest"],

  rules: {
    "@typescript-eslint/quotes": "off",
    "class-methods-use-this": "off",
    "import/no-cycle": "off",
    "import/prefer-default-export": "off",
    "simple-import-sort/sort": "error",
    "no-console": "off",
    "no-param-reassign": "off",
    "no-return-assign": "off",
    "no-underscore-dangle": "off"
  },

  parserOptions: {
    project: "./tsconfig.json"
  },

  env: {
    "jest/globals": true
  }
};
