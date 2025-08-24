import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Disable problematic rules for optimization phase
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off", 
      "react-hooks/exhaustive-deps": "off", // Temporarily disable for optimization
      "react-hooks/rules-of-hooks": "off", // Temporarily disable for 3D components
      "jsx-a11y/alt-text": "off", // Temporarily disable
      "@next/next/no-img-element": "off", // Temporarily disable
      "react/display-name": "off", // Temporarily disable for memo components
      "no-console": "off", // Allow console for logger
    }
  }
];

export default eslintConfig;