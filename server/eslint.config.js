import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
    rules: {
      eqeqeq: "error",
      "no-var": "error",
      "prefer-const": "error",
      curly: "error",
      "no-shadow": "warn",
      "no-console": "warn",
      // Express error handlers must declare (err, req, res, next) even if next is unused
      "no-unused-vars": ["error", { argsIgnorePattern: "^(_|next$)" }],
    },
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: { globals: { ...globals.node, ...globals.jest } },
  },
]);
