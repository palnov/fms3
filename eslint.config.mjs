import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".agents/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["scripts/**/*.ts", "src/app/api/parser/**/*.ts"],
    rules: {
      // Parser manifests and third-party responses are intentionally schema-flexible.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;
