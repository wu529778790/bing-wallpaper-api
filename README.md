# Bing Wallpaper API

获取必应每日壁纸的轻量 npm 包，支持按日期、时区、分辨率和市场获取图片信息，提供 TypeScript 类型定义，同时兼容 ESM 和 CommonJS。

[![npm version](https://img.shields.io/npm/v/bing-wallpaper-api.svg)](https://www.npmjs.com/package/bing-wallpaper-api)
[![npm downloads](https://img.shields.io/npm/dm/bing-wallpaper-api.svg)](https://www.npmjs.com/package/bing-wallpaper-api)
[![GitHub license](https://img.shields.io/github/license/wu529778790/bing-wallpaper-api)](https://github.com/wu529778790/bing-wallpaper-api/blob/main/LICENSE)

演示项目: https://github.com/wu529778790/bing-wallpaper  
演示地址: https://bing.shenzjd.com/

## 特性

- 获取必应每日壁纸
- 支持按日期获取最近 7 天壁纸
- 支持多种分辨率
- 支持多个 Bing 市场
- 支持显式指定 IANA 时区
- 内置内存缓存
- 提供完整 TypeScript 类型
- 同时支持 ESM 和 CommonJS

## 安装

```bash
npm install bing-wallpaper-api
```

## 快速开始

### ESM

```ts
import { getBingWallpaper } from "bing-wallpaper-api";

const wallpaper = await getBingWallpaper({
  timezone: "Asia/Shanghai",
  resolution: "UHD",
});

console.log(wallpaper.title);
console.log(wallpaper.url);
```

### CommonJS

```js
const { getBingWallpaper } = require("bing-wallpaper-api");

(async () => {
  const wallpaper = await getBingWallpaper();
  console.log(wallpaper.url);
})();
```

## API

### `getBingWallpaper(options?)`

返回值类型为 `Promise<BingWallpaperData>`。

```ts
import { getBingWallpaper } from "bing-wallpaper-api";

const today = await getBingWallpaper();
const yesterday = await getBingWallpaper({ index: 1 });
const specific = await getBingWallpaper({ date: "2026-03-01" });
const usWallpaper = await getBingWallpaper({ market: "en-US" });
```

### `clearBingWallpaperCache()`

清空库内部的内存缓存，适合长生命周期进程主动回收。

```ts
import { clearBingWallpaperCache } from "bing-wallpaper-api";

clearBingWallpaperCache();
```

## 类型

```ts
import dayjs from "dayjs";

interface BingWallpaperOptions {
  date?: Date | dayjs.Dayjs | string;
  timezone?: string;
  resolution?:
    | "UHD"
    | "1920x1200"
    | "1920x1080"
    | "1366x768"
    | "1280x768"
    | "1024x768"
    | "800x600"
    | "800x480"
    | "768x1280"
    | "720x1280"
    | "640x480"
    | "480x800"
    | "400x240"
    | "320x240"
    | "240x320";
  market?: "zh-CN" | "en-US" | "ja-JP" | "en-AU" | "en-GB" | "de-DE" | "en-NZ" | "en-CA";
  index?: number;
}

interface BingWallpaperData {
  url: string;
  title: string;
  copyright: string;
  copyrightlink?: string;
  startdate: string;
  urlbase: string;
}
```

## 说明

- `index` 仅支持 `0-7`
- `date` 和 `index` 不能同时传入
- 当传入 `date` 时，会按指定时区计算与“今天”的天数差
- 备用数据源仅用于默认市场下的“今日壁纸”场景，避免回退时返回错误日期或错误市场的数据

## 开发

```bash
pnpm install
pnpm run build
pnpm run test
```

## License

MIT
