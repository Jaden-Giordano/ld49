module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2021,
  },
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/typescript/recommended',
    '@vue/prettier',
    '@vue/prettier/@typescript-eslint',
  ],
};
