import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  return {
    base: mode === 'production' ? '/cims/' : '/',
    plugins: [react(), tsconfigPaths(), tailwindcss()],
  };
});
