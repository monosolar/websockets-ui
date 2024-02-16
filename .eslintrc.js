/* eslint-disable */
module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'airbnb-base',
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    overrides: [
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint',
    ],
    ignorePatterns: ['build/*'],
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
        },
    },
    rules: {
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                js: 'never',
                jsx: 'never',
                ts: 'never',
                tsx: 'never',
            },
        ],
        "linebreak-style": ["error", "unix"]
    },
};