module.exports = {
    extends: "eslint:recommended",
    env: {
        es6: true,
    },
    rules: {
        "arrow-parens": ["error", "always"],
        "prefer-arrow-callback": ["error", {
            "allowNamedFunctions": true
        }],
        indent: ["error", 4],
        "linebreak-style": ["error", "unix"],
        quotes: ["error", "double"],
        semi: ["error", "always"]
    },
};
