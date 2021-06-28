module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        "prettier",
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    rules: {
        "no-unused-vars": 0, // TODO: Remove this at some point
        "no-undef": 0 // https://stackoverflow.com/questions/64170868/why-eslint-consider-jsx-or-some-react-types-undefined-since-upgrade-typescript
    },
}