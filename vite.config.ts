import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { viteStaticCopy } from "vite-plugin-static-copy";

// The JSBSim WebAssembly runtime is served as static files so the worker can load it by URL.
const jsbsimWasm = "node_modules/@0x62/jsbsim-wasm/dist/wasm";

export default defineConfig({
  base: "./",
  plugins: [
    viteStaticCopy({
      targets: [
        { src: `${jsbsimWasm}/*`, dest: "jsbsim-wasm", rename: { stripBase: true } },
      ],
    }),
  ],
  optimizeDeps: {
    exclude: ["@0x62/jsbsim-wasm"],
  },
  worker: {
    format: "es",
  },
  build: {
    target: "es2022",
    rollupOptions: {
      // Pages: the welcome page (index.html), the A320 (a320.html), the C172 (c172.html), the PA-28
      // (pa28.html, same script as the C172), the B737 (737.html), the glossary (glossary.html)
      // and the DGCA Ground School (ground-school.html).
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        a320: fileURLToPath(new URL("./a320.html", import.meta.url)),
        c172: fileURLToPath(new URL("./c172.html", import.meta.url)),
        pa28: fileURLToPath(new URL("./pa28.html", import.meta.url)),
        b737: fileURLToPath(new URL("./737.html", import.meta.url)),
        glossary: fileURLToPath(new URL("./glossary.html", import.meta.url)),
        ground: fileURLToPath(new URL("./ground-school.html", import.meta.url)),
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
