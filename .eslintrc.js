module.exports = {
  extends: [
    'airbnb-typescript/base',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended'
  ],

  plugins: [
    'jest'
  ],

  rules: {
    'no-console': 'off',
    'import/no-cycle': 'off',
    
    '@typescript-eslint/no-unused-vars': [ 'error', { 'argsIgnorePattern': '^_' } ],
    'no-param-reassign': ['error', { 'props': true, 'ignorePropertyModificationsFor': [ 'args' ] }]
  },

  env: {
    "jest/globals": true
  }
}