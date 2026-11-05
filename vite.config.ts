import { defineConfig } from "vite";
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
    chunkSizeWarningLimit: 1000,
  },
});
