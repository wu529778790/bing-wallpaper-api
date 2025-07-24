import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./lib/main.ts",
      name: "BingWallpaper",
      fileName: "bing-wallpaper",
    },
    rollupOptions: {
      // 确保外部化依赖不会被打包到库中
      external: ["dayjs"],
      output: {
        // 在 UMD 构建模式下为外部化的依赖提供全局变量
        globals: {
          dayjs: "dayjs",
        },
      },
    },
    target: "node14", // 支持 Node.js 14+
  },
});
