import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import js from "@eslint/js";
import globals from "globals";

export default [
    {
        ignores: ["**/node_modules/**", "dist/**", ".wrangler/**", "worker-configuration.d.ts", "**/*.js", "**/*.mjs"]
    },
    js.configs.recommended,
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: tsParser,
            sourceType: "module",
            ecmaVersion: 2022,
            globals: {
                ...globals.browser, // Adds fetch, Response, Request, URL, crypto, TextEncoder
                ...globals.node,    // Adds Buffer, process, console
                ...globals.serviceworker
            }
        },
        plugins: {
            "@typescript-eslint": tsPlugin
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            "@typescript-eslint/no-explicit-any": "warn",
            "no-console": "off",
            "no-undef": "off",
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["error", {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_"
            }],
            "no-empty": ["error", { "allowEmptyCatch": false }],
            "@typescript-eslint/ban-ts-comment": ["error", {
                "ts-expect-error": "allow-with-description",
                "ts-ignore": true
            }]
        }
    }
];
