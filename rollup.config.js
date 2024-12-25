import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { rollupPluginHTML as html } from "@web/rollup-plugin-html";
import copy from "rollup-plugin-copy";
import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";

export default [
    {
        input: "packages/memoinjo-core/popup.html",
        output: {
            dir: "dist/chrome/popup",
            format: "iife",
            sourcemap: true,
            name: "MemoInjoPopup",
        },
        plugins: [
            resolve(),
            commonjs(),
            html({
                js: true,
                css: true,
            }),
            typescript({
                module: "esnext",
            }),
            postcss(),
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
                        src: "packages/memoinjo-core/icon128.png",
                        dest: "dist/chrome/memoinjo",
                    },
                    {
                        src: "packages/memoinjo-core/icon128.png",
                        dest: "dist/firefox/memoinjo",
                    },
                ],
            }),
        ],
    },

    {
        input: "packages/memoinjo-core/popup.html",
        output: {
            dir: "dist/firefox/popup",
            format: "iife",
            sourcemap: true,
            name: "MemoInjoPopup",
        },
        plugins: [
            resolve(),
            commonjs(),
            html({
                js: true,
                css: true,
            }),
            typescript({
                module: "esnext",
            }),
            postcss(),
        ],
    },

    {
        input: "packages/memoinjo-core/options.html",
        output: {
            dir: "dist/chrome/options",
            format: "iife",
            sourcemap: true,
            name: "MemoInjoOptions",
        },
        plugins: [
            resolve(),
            commonjs(),
            html({
                js: true,
                css: true,
            }),
            typescript({
                module: "esnext",
            }),
            postcss(),
        ],
    },
    {
        input: "packages/memoinjo-core/options.html",
        output: {
            dir: "dist/firefox/options",
            format: "iife",
            sourcemap: true,
            name: "MemoInjoOptions",
        },
        plugins: [
            resolve(),
            commonjs(),
            html({
                js: true,
                css: true,
            }),
            typescript({
                module: "esnext",
            }),
            postcss(),
        ],
    },
];
