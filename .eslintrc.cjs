module.exports = {
  env: {
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  extends: ["airbnb-base", "prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
    "no-console": "off",
    "import/no-dynamic-require": "off",
    "no-await-in-loop": "off",
    quotes: ["error", "double"],
  },
  ignorePatterns: ["node_modules/**/*"],
};
