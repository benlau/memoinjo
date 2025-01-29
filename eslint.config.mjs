import globals from "globals";
import babelParser from "@babel/eslint-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import { ESLint } from "eslint";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import reactHooksPlugin from "eslint-plugin-react-hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: [
            "**/node_modules",
            "**/dist",
            "**/bower_components",
            "**/jest.config.js",
            "**/lib",
            "**/globals.d.ts",
            "target/memoinjo-firefox/memoinjo",
            "target/memoinjo-chrome/memoinjo",
        ],
    },
    {
        files: ["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"],
        plugins: {
            "@typescript-eslint": typescriptEslintPlugin,
            "react-hooks": reactHooksPlugin,
        },

        languageOptions: {
            globals: {
                ...globals.jest,
                ...globals.browser,
                ...globals.webextensions,
                AudioWorkletGlobalScope: "readonly",
            },

            parser: typescriptParser,
            ecmaVersion: 13,
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },

        rules: {
            indent: ["error", 4],
            quotes: [2, "double"],
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            "no-unused-vars": [
                "warn",
                {
                    vars: "local",
                    args: "after-used",
                    ignoreRestSiblings: false,
                    varsIgnorePattern: "^_",
                    argsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-use-client": "off",
            "no-restricted-syntax": [
                "off",
                {
                    selector:
                        "ExpressionStatement > Literal[value='use client']",
                    message: "'use client' directive is ignored.",
                },
            ],

            "no-promise-executor-return": 0,
            "consistent-return": 0,
            "no-await-in-loop": 0,
            "no-continue": 0,
            "class-methods-use-this": 0,
            "operator-linebreak": 0,
            "import/no-unresolved": 0,
            "implicit-arrow-linebreak": 0,
        },
    },
];
