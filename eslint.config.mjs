import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
    rules: {
      // Warn instead of error for `any` — or use "off" to disable entirely
      "@typescript-eslint/no-explicit-any": "warn",

      // Warn (not error) on unused vars; ignore those starting with `_`
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],

      // Warn for missing deps in useEffect instead of error
      "react-hooks/exhaustive-deps": "warn",

      // Allow <img> tag (optional)
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
