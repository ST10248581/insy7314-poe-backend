import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // General JS files
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
  },

  // Force CommonJS for JS files
  {
    files: ["**/*.js"],
    languageOptions: { sourceType: "commonjs" },
  },

  // Jest override for test files
  {
    files: ["**/__tests__/**", "**/*.test.js"],
    languageOptions: { globals: globals.jest },
  },
]);
