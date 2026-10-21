import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/node_modules/**",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    extends: [tseslint.configs.recommended],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
]);
