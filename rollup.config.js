const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const { rollupPluginHTML: html } = require("@web/rollup-plugin-html");
const copy = require("rollup-plugin-copy");
const typescript = require("@rollup/plugin-typescript");
const postcss = require("rollup-plugin-postcss");
const replace = require("@rollup/plugin-replace");

const plugins = [
    resolve(),
    commonjs(),
    html({
        js: true,
        css: true,
    }),
    typescript({
        module: "esnext",
        jsx: "react",
    }),
    postcss({
        extract: false,
        plugins: [require("tailwindcss"), require("autoprefixer")],
    }),
    replace({
        "process.env.NODE_ENV": JSON.stringify("production"),
        preventAssignment: true,
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
    },
    // {
    //     input: "src/styles/tailwind.css",
    //     output: {
    //         file: "dist/chrome/popup/tailwind.css",
    //         format: "es",
    //     },
    //     plugins: [
    //         postcss({
    //             extract: true,
    //             plugins: [require("tailwindcss"), require("autoprefixer")],
    //         }),
    //     ],
    // },
    {
        input: "src/popup.html",
        output: {
            dir: "dist/firefox/popup",
            format: "iife",
            sourcemap: true,
            name: "MemoInjoPopup",
        },
        plugins: [...plugins],
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
    },
];
