import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// CesiumJS needs its Workers, Assets, Widgets and ThirdParty folders served as static files.
// The JSBSim WebAssembly runtime is served the same way so the worker can load it by URL.
const cesiumBuild = "node_modules/cesium/Build/Cesium";
const jsbsimWasm = "node_modules/@0x62/jsbsim-wasm/dist/wasm";

export default defineConfig({
  define: {
    CESIUM_BASE_URL: JSON.stringify("./cesium"),
  },
  base: "./",
  plugins: [
    viteStaticCopy({
      targets: [
        { src: `${cesiumBuild}/Workers`, dest: "cesium", rename: { stripBase: 4 } },
        { src: `${cesiumBuild}/ThirdParty`, dest: "cesium", rename: { stripBase: 4 } },
        { src: `${cesiumBuild}/Assets`, dest: "cesium", rename: { stripBase: 4 } },
        { src: `${cesiumBuild}/Widgets`, dest: "cesium", rename: { stripBase: 4 } },
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
    chunkSizeWarningLimit: 6000,
  },
});
