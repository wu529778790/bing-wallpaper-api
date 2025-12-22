import dayjs from "dayjs";

export interface BingWallpaperData {
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

export interface BingWallpaperOptions {
  /** 日期，可以是 Date 对象、dayjs 对象或日期字符串 */
  date?: Date | dayjs.Dayjs | string;
  /** 壁纸分辨率，默认为 1920x1080 */
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
  /** 市场区域，默认为 'zh-CN' */
  market?:
    | "zh-CN"
    | "en-US"
    | "ja-JP"
    | "en-AU"
    | "en-GB"
    | "de-DE"
    | "en-NZ"
    | "en-CA";
  /** 壁纸索引，0表示今天，1表示昨天，以此类推，默认为0 */
  index?: number;
}

/** 自定义错误类型 */
export class BingWallpaperError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'BingWallpaperError';
  }
}

/** API响应数据类型 */
interface BingApiResponse {
  images: Array<{
    url: string;
    urlbase: string;
    title: string;
    copyright: string;
    copyrightlink?: string;
    startdate: string;
  }>;
}

/** 缓存项接口 */
interface CacheItem {
  data: BingWallpaperData;
  timestamp: number;
  ttl: number; // 存活时间（毫秒）
}

/** 简单的内存缓存类 */
class SimpleCache {
  private cache: Map<string, CacheItem> = new Map();

  get(key: string): BingWallpaperData | null {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key: string, data: BingWallpaperData, ttl: number = 3600000): void { // 默认1小时
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new SimpleCache();

/** 验证分辨率是否有效 */
function isValidResolution(resolution: string): boolean {
  const validResolutions: Array<
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
    | "240x320"
  > = [
    "UHD",
    "1920x1200",
    "1920x1080",
    "1366x768",
    "1280x768",
    "1024x768",
    "800x600",
    "800x480",
    "768x1280",
    "720x1280",
    "640x480",
    "480x800",
    "400x240",
    "320x240",
    "240x320"
  ];

  return validResolutions.includes(resolution as any);
}

/** 验证市场区域是否有效 */
function isValidMarket(market: string): boolean {
  const validMarkets: Array<
    | "zh-CN"
    | "en-US"
    | "ja-JP"
    | "en-AU"
    | "en-GB"
    | "de-DE"
    | "en-NZ"
    | "en-CA"
  > = [
    "zh-CN",
    "en-US",
    "ja-JP",
    "en-AU",
    "en-GB",
    "de-DE",
    "en-NZ",
    "en-CA"
  ];

  return validMarkets.includes(market as any);
}

/** 带超时的 fetch 函数 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout: number = 10000): Promise<Response> {
  // 创建 AbortController 来控制请求超时
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new BingWallpaperError('请求超时', 'REQUEST_TIMEOUT');
    }
    throw error;
  }
}

/**
 * 获取必应每日壁纸
 * @param options 配置选项
 * @returns Promise<BingWallpaperData> 壁纸数据
 */
export async function getBingWallpaper(
  options: BingWallpaperOptions = {}
): Promise<BingWallpaperData> {
  // 生成缓存键
  const cacheKey = JSON.stringify(options);
  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const {
    date,
    resolution = "1920x1080",
    market = "zh-CN",
    index = 0,
  } = options;

  // 验证并标准化参数
  if (index !== undefined && (index < 0 || index > 7)) {
    throw new BingWallpaperError(`索引必须在 0-7 之间，当前值: ${index}`, "INVALID_INDEX");
  }

  if (resolution && !isValidResolution(resolution)) {
    throw new BingWallpaperError(`不支持的分辨率: ${resolution}`, "INVALID_RESOLUTION");
  }

  if (market && !isValidMarket(market)) {
    throw new BingWallpaperError(`不支持的市场区域: ${market}`, "INVALID_MARKET");
  }

  let targetDate: dayjs.Dayjs;

  // 处理日期参数
  if (date) {
    if (typeof date === "string") {
      targetDate = dayjs(date);
      if (!targetDate.isValid()) {
        throw new BingWallpaperError("无效的日期格式", "INVALID_DATE");
      }
    } else if (date instanceof Date) {
      targetDate = dayjs(date);
      if (!targetDate.isValid()) {
        throw new BingWallpaperError("无效的日期对象", "INVALID_DATE");
      }
    } else {
      targetDate = date; // dayjs 对象
      if (!targetDate.isValid()) {
        throw new BingWallpaperError("无效的日期对象", "INVALID_DATE");
      }
    }
  } else {
    targetDate = dayjs();
  }

  // 如果指定了日期，计算与今天的差值作为index
  let calculatedIndex = index;
  if (date) {
    const today = dayjs();
    calculatedIndex = today.diff(targetDate, "day");

    // 验证索引范围，Bing API通常只支持前7天的数据
    if (calculatedIndex < 0 || calculatedIndex > 7) {
      throw new BingWallpaperError(
        `索引超出范围，仅支持0-7之间的值，当前值: ${calculatedIndex}`,
        "INDEX_OUT_OF_RANGE"
      );
    }
  }

  try {
    // 使用必应官方的API端点
    const apiUrl = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=${calculatedIndex}&n=1&mkt=${market}`;

    const response = await fetchWithTimeout(apiUrl);

    if (!response.ok) {
      throw new BingWallpaperError(
        `Bing API 请求失败，状态码: ${response.status} ${response.statusText}`,
        "API_ERROR"
      );
    }

    const data: BingApiResponse = await response.json();

    if (!data.images || data.images.length === 0) {
      throw new BingWallpaperError("没有找到壁纸数据", "NO_DATA_FOUND");
    }

    const image = data.images[0];

    // 构建完整的图片URL
    let imageUrl = image.url;
    if (!imageUrl.startsWith("http")) {
      imageUrl = `https://www.bing.com${imageUrl}`;
    }

    // 处理分辨率
    if (resolution !== "1920x1080") {
      imageUrl = imageUrl.replace(/1920x1080/, resolution);
    }

    const result: BingWallpaperData = {
      url: imageUrl,
      title: image.title || "必应每日壁纸",
      copyright: image.copyright || "",
      copyrightlink: image.copyrightlink
        ? image.copyrightlink.startsWith("http")
          ? image.copyrightlink
          : `https://www.bing.com${image.copyrightlink}`
        : undefined,
      startdate: image.startdate || targetDate.format("YYYYMMDD"),
      urlbase: image.urlbase || "",
    };

    // 将结果存储到缓存中
    cache.set(cacheKey, result);

    return result;
  } catch (error) {
    // 如果官方API失败，尝试备用API
    try {
      const backupUrl = "https://bingw.jasonzeng.dev/?format=json";
      const response = await fetchWithTimeout(backupUrl);

      if (!response.ok) {
        throw new BingWallpaperError(
          `备用 API 请求失败，状态码: ${response.status} ${response.statusText}`,
          "BACKUP_API_ERROR"
        );
      }

      const data = await response.json();

      const result: BingWallpaperData = {
        url: data.url || "",
        title: data.title || "必应每日壁纸",
        copyright: data.copyright || "",
        copyrightlink: undefined,
        startdate: data.startdate || dayjs().format("YYYYMMDD"),
        urlbase: data.urlbase || "",
      };

      // 将备用结果也存储到缓存中
      cache.set(cacheKey, result);

      return result;
    } catch (backupError) {
      if (error instanceof BingWallpaperError) {
        throw error;
      }

      throw new BingWallpaperError(
        `获取必应壁纸失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`,
        "FETCH_FAILED"
      );
    }
  }
}

// 默认导出主函数
export default getBingWallpaper;
