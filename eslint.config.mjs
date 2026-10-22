import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import nextConfig from "eslint-config-next";

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
  ...nextConfig,
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    extends: [tseslint.configs.recommended],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
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
