module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: 2017,
        sourceType: 'module',
        ecmaFeatures: {
            experimentalObjectRestSpread: true,
        },
    },
    extends: 'futu',
    rules:{
        "semi": ["error", "always"],
        "no-console": 0,
        "no-shadow": ["error", { "builtinGlobals": false, "hoist": "functions", "allow": [] }]
    },
    globals:{
        "document": true,
        "localStorage": true,
        "window": true
    },
    env: {
        "es6": true,
        "node": true
    }
};
