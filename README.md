# 必应壁纸 (Bing Wallpaper Api)

一个获取必应每日壁纸的 npm 包，支持指定日期、分辨率等参数。使用 TypeScript 编写，提供完整的类型定义。

演示项目：<https://github.com/wu529778790/bing-wallpaper>

演示地址：<https://bing.shenzjd.com/>

[![npm version](https://img.shields.io/npm/v/bing-wallpaper-api.svg)](https://www.npmjs.com/package/bing-wallpaper-api)
[![npm downloads](https://img.shields.io/npm/dm/bing-wallpaper-api.svg)](https://www.npmjs.com/package/bing-wallpaper-api)
[![GitHub license](https://img.shields.io/github/license/wu529778790/bing-wallpaper-api)](https://github.com/wu529778790/bing-wallpaper-api/blob/main/LICENSE)

## ✨ 特性

- 🎯 获取必应每日壁纸
- 📅 支持指定日期获取历史壁纸
- 🖼️ 支持多种分辨率
- 🌍 支持多个地区市场
- 📦 轻量级，无额外依赖（除了 dayjs）
- 🔧 完整的 TypeScript 支持
- 🚀 同时支持 ESM 和 CommonJS
- 🛡️ 严格的安全策略，无隐私风险

## 📦 安装

```bash
npm install bing-wallpaper-api
# 或
pnpm install bing-wallpaper-api
# 或
yarn add bing-wallpaper-api
```

## 🚀 快速开始

### ESM (推荐)

```javascript
import { getBingWallpaper } from 'bing-wallpaper-api';

// 获取今日壁纸
const todayWallpaper = await getBingWallpaper();
console.log('今日壁纸:', todayWallpaper.url);

// 获取指定日期的壁纸
const wallpaper = await getBingWallpaper({ date: '2024-01-01' });
console.log('元旦壁纸:', wallpaper.title);
```

### CommonJS

```javascript
const { getBingWallpaper } = require('bing-wallpaper-api');

// 获取今日壁纸
(async () => {
  const wallpaper = await getBingWallpaper();
  console.log('今日壁纸:', wallpaper.url);
})();
```

## 📖 API 文档

### `getBingWallpaper(options?)`

获取必应壁纸的主函数，支持各种配置选项。

**参数:**

- `options` (可选): 配置选项对象

**返回:** `Promise<BingWallpaperData>`

```javascript
import { getBingWallpaper } from 'bing-wallpaper-api';

// 获取今日壁纸
const wallpaper = await getBingWallpaper();

// 获取昨天的壁纸
const yesterday = await getBingWallpaper({ index: 1 });

// 获取指定日期的壁纸
const specific = await getBingWallpaper({ 
  date: '2024-01-01',
  resolution: 'UHD'
});

// 获取指定日期的壁纸（支持多种日期格式）
const wallpaper1 = await getBingWallpaper({ date: '2024-01-01' });
const wallpaper2 = await getBingWallpaper({ date: new Date('2024-01-01') });

// 获取今日高清壁纸
const uhd = await getBingWallpaper({ resolution: 'UHD' });
```

## 🔧 配置选项

### `BingWallpaperOptions`

```typescript
interface BingWallpaperOptions {
  /** 日期，可以是 Date 对象、dayjs 对象或日期字符串 */
  date?: Date | dayjs.Dayjs | string;
  
  /** 壁纸分辨率，默认为 1920x1080 */
  resolution?: 'UHD' | '1920x1200' | '1920x1080' | '1366x768' | '1280x768' 
    | '1024x768' | '800x600' | '800x480' | '768x1280' | '720x1280' 
    | '640x480' | '480x800' | '400x240' | '320x240' | '240x320';
  
  /** 市场区域，默认为 'zh-CN' */
  market?: 'zh-CN' | 'en-US' | 'ja-JP' | 'en-AU' | 'en-GB' | 'de-DE' | 'en-NZ' | 'en-CA';
  
  /** 壁纸索引，0表示今天，1表示昨天，以此类推，默认为0 */
  index?: number;
}
```

### `BingWallpaperData`

```typescript
interface BingWallpaperData {
  /** 壁纸的URL链接 */
  url: string;
  
  /** 壁纸标题 */
  title: string;
  
  /** 版权信息 */
  copyright: string;
  
  /** 版权链接 */
  copyrightlink?: string;
  
  /** 日期，格式为 YYYYMMDD */
  startdate: string;
  
  /** URL基础路径 */
  urlbase: string;
}
```

## 📝 使用示例

### 基础用法

```javascript
import { getBingWallpaper } from 'bing-wallpaper-api';

// 获取今日壁纸
const today = await getBingWallpaper();
console.log('标题:', today.title);
console.log('图片链接:', today.url);
console.log('版权信息:', today.copyright);
```

### 获取不同分辨率

```javascript
import { getBingWallpaper } from 'bing-wallpaper-api';

// 获取超高清壁纸
const uhd = await getBingWallpaper({ resolution: 'UHD' });

// 获取移动端适配的壁纸
const mobile = await getBingWallpaper({ resolution: '720x1280' });
```

### 获取历史壁纸

```javascript
import { getBingWallpaper } from 'bing-wallpaper-api';

// 获取昨天的壁纸
const yesterday = await getBingWallpaper({ index: 1 });

// 获取一周前的壁纸
const weekAgo = await getBingWallpaper({ index: 7 });

// 获取指定日期的壁纸
const newYear = await getBingWallpaper({ date: '2024-01-01' });
```

### 获取不同地区的壁纸

```javascript
import { getBingWallpaper } from 'bing-wallpaper-api';

// 获取美国地区的壁纸
const us = await getBingWallpaper({ market: 'en-US' });

// 获取日本地区的壁纸
const jp = await getBingWallpaper({ market: 'ja-JP' });
```

### 下载壁纸

```javascript
import { getBingWallpaper } from 'bing-wallpaper-api';
import fs from 'fs';

async function downloadWallpaper() {
  try {
    // 获取今日超高清壁纸
    const wallpaper = await getBingWallpaper({ resolution: 'UHD' });
    
    // 获取图片数据
    const response = await fetch(wallpaper.url);
    const buffer = await response.arrayBuffer();
    
    // 保存到本地
    const filename = `bing-wallpaper-${wallpaper.startdate}.jpg`;
    fs.writeFileSync(filename, Buffer.from(buffer));
    
    console.log(`壁纸已保存为: ${filename}`);
    console.log(`标题: ${wallpaper.title}`);
  } catch (error) {
    console.error('下载失败:', error.message);
  }
}

downloadWallpaper();
```

### 高级用法组合

```javascript
import { getBingWallpaper } from 'bing-wallpaper-api';
import dayjs from 'dayjs';

// 结合 dayjs 使用
const lastWeek = await getBingWallpaper({ 
  date: dayjs().subtract(7, 'day'),
  resolution: 'UHD',
  market: 'en-US'
});

// 批量获取最近一周的壁纸
async function getWeeklyWallpapers() {
  const wallpapers = [];
  for (let i = 0; i < 7; i++) {
    const wallpaper = await getBingWallpaper({ index: i });
    wallpapers.push(wallpaper);
  }
  return wallpapers;
}
```

## 🛠️ 开发

### 构建

```bash
pnpm install
pnpm run build
```

### 测试

```bash
pnpm run test
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 💡 建议

以下是一些建议和最佳实践：

1. **缓存机制**: 对于相同日期的请求，建议在应用层实现缓存机制
2. **错误处理**: 网络请求可能失败，请妥善处理异常情况
3. **图片尺寸**: 根据实际使用场景选择合适的分辨率
4. **使用限制**: 请遵守必应的使用条款，不要过度频繁地请求API

## 🔗 相关链接

- [必应首页](https://www.bing.com)
- [dayjs 文档](https://day.js.org/)

---

如果觉得这个包对你有帮助，请给个 ⭐ 支持一下！

## 📄 许可证

MIT License