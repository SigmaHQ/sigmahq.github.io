import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

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
      "**/node_modules/",
      "**/.vitepress/dist/",
      "**/.vitepress/cache/",
    ],
  },
  ...compat
    .extends("plugin:vue/essential", "eslint:recommended")
    .map((config) => ({
      ...config,
      files: ["**/*.ts", "**/*.js", "**/*.vue"],
    })),
  {
    files: ["**/*.ts", "**/*.js", "**/*.vue"],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },

    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-multiple-template-root": "off",
    },
  },
];
