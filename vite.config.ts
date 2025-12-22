import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./lib/main.ts",
      name: "BingWallpaperApi",
      fileName: (format) => {
        if (format === 'cjs') {
          return `bing-wallpaper-api.cjs`;
        } else if (format === 'es') {
          return `bing-wallpaper-api.js`;
        } else {
          return `bing-wallpaper-api.${format}.js`;
        }
      },
      formats: ['es', 'cjs', 'umd'], // 明确指定输出格式
    },
    rollupOptions: {
      // 确保外部化依赖不会被打包到库中
      external: ["dayjs"],
      output: {
        // 在 UMD 构建模式下为外部化的依赖提供全局变量
        globals: {
          dayjs: "dayjs",
        },
        // 为不同格式提供清晰的文件名
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'bing-wallpaper-api.css';
          }
          return 'bing-wallpaper-api.[ext]';
        },
        exports: 'named' // 指定为命名导出，消除警告
      },
    },
    target: "node16", // 支持 Node.js 16+，更现代的版本
    minify: false, // 库文件通常不压缩，便于调试
    sourcemap: true, // 生成源码映射，便于调试
    emptyOutDir: true, // 构建前清空输出目录
  },
});
