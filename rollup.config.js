const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const { rollupPluginHTML: html } = require("@web/rollup-plugin-html");
const copy = require("rollup-plugin-copy");
const typescript = require("@rollup/plugin-typescript");
const postcss = require("rollup-plugin-postcss");
const replace = require("@rollup/plugin-replace");

const react = require("react");
const reactDom = require("react-dom");
const reactIs = require("react-is");
const jsxRuntime = require("react/jsx-runtime");

function onwarn(warning, warn) {
    // Suppress the specific warning about "use client" directives
    if (
        warning.code === "MODULE_LEVEL_DIRECTIVE" &&
        // eslint-disable-next-line quotes
        warning.message.includes('"use client"')
    ) {
        return;
    }

    // Suppress circular dependency warnings for @radix-ui packages
    if (
        warning.code === "CIRCULAR_DEPENDENCY" &&
        warning.message.includes("@radix-ui")
    ) {
        return;
    }

    // Let Rollup handle all other warnings normally
    warn(warning);
}

const plugins = [
    typescript({
        module: "esnext",
        jsx: "react",
    }),

    // Resovle node modules
    resolve({
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        browser: true,
    }),
    // Convert CommonJS modules to ES6
    commonjs({
        include: "node_modules/**",
        namedExports: {
            react: Object.keys(react),
            "react-dom": Object.keys(reactDom),
            "react-is": Object.keys(reactIs),
            "react/jsx-runtime": Object.keys(jsxRuntime),
        },
    }),
    html({
        js: true,
        css: true,
    }),
    postcss({
        extract: false,
        plugins: [require("tailwindcss"), require("autoprefixer")],
    }),
    replace({
        preventAssignment: true,
        values: {
            "process.env.NODE_ENV": JSON.stringify("production"),
        },
    }),
    copy({
        targets: [
            {
                src: "target/memoinjo-chrome/manifest.json",
                dest: "dist/chrome",
            },
            {
                src: "target/memoinjo-firefox/manifest.json",
                dest: "dist/firefox",
            },
            {
                src: "src/icon16.png",
                dest: "dist/chrome/memoinjo",
            },
            {
                src: "src/icon16.png",
                dest: "dist/firefox/memoinjo",
            },
            {
                src: "src/icon128.png",
                dest: "dist/chrome/memoinjo",
            },
            {
                src: "src/icon128.png",
                dest: "dist/firefox/memoinjo",
            },
        ],
    }),
];

module.exports = [
    {
        input: "src/popup.html",
        output: {
            dir: "dist/chrome/popup",
            format: "iife",
            sourcemap: true,
            name: "MemoInjoPopup",
        },
        plugins: [...plugins],
        onwarn: onwarn,
    },
    {
        input: "src/popup.html",
        output: {
            dir: "dist/firefox/popup",
            format: "iife",
            sourcemap: true,
            name: "MemoInjoPopup",
        },
        plugins: [...plugins],
        onwarn: onwarn,
    },

    {
        input: "src/options.html",
        output: {
            dir: "dist/chrome/options",
            format: "iife",
            sourcemap: true,
            name: "MemoInjoOptions",
        },
        plugins: [...plugins],
        onwarn: onwarn,
    },
    {
        input: "src/options.html",
        output: {
            dir: "dist/firefox/options",
            format: "iife",
            sourcemap: true,
            name: "MemoInjoOptions",
        },
        plugins: [...plugins],
        onwarn: onwarn,
    },
];
