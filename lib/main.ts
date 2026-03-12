import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import timezonePlugin from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);
dayjs.extend(timezonePlugin);
dayjs.extend(customParseFormat);

const VALID_RESOLUTIONS = [
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
  "240x320",
] as const;

const VALID_MARKETS = [
  "zh-CN",
  "en-US",
  "ja-JP",
  "en-AU",
  "en-GB",
  "de-DE",
  "en-NZ",
  "en-CA",
] as const;

type Resolution = (typeof VALID_RESOLUTIONS)[number];
type Market = (typeof VALID_MARKETS)[number];

const VALID_RESOLUTION_SET = new Set<string>(VALID_RESOLUTIONS);
const VALID_MARKET_SET = new Set<string>(VALID_MARKETS);
const DEFAULT_RESOLUTION: Resolution = "1920x1080";
const DEFAULT_MARKET: Market = "zh-CN";
const CACHE_TTL_MS = 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_INDEX = 7;

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
  /** IANA 时区，例如 Asia/Shanghai。未传时使用运行环境本地时区 */
  timezone?: string;
  /** 壁纸分辨率，默认为 1920x1080 */
  resolution?: Resolution;
  /** 市场区域，默认为 'zh-CN' */
  market?: Market;
  /** 壁纸索引，0表示今天，1表示昨天，以此类推，默认为0 */
  index?: number;
}

/** 自定义错误类型 */
export class BingWallpaperError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = "BingWallpaperError";
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

  set(key: string, data: BingWallpaperData, ttl: number = CACHE_TTL_MS): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new SimpleCache();

/** 验证分辨率是否有效 */
function isValidResolution(resolution: string): resolution is Resolution {
  return VALID_RESOLUTION_SET.has(resolution);
}

/** 验证市场区域是否有效 */
function isValidMarket(market: string): market is Market {
  return VALID_MARKET_SET.has(market);
}

/** 验证 IANA 时区是否有效 */
function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

function getNow(timezone?: string): dayjs.Dayjs {
  return timezone ? dayjs().tz(timezone) : dayjs();
}

function parseTargetDate(date: BingWallpaperOptions["date"], timezone?: string): dayjs.Dayjs {
  if (typeof date === "string") {
    return timezone ? dayjs.tz(date, timezone) : dayjs(date);
  }

  if (date instanceof Date) {
    const parsed = dayjs(date);
    return timezone ? parsed.tz(timezone) : parsed;
  }

  if (timezone) {
    return date!.tz(timezone);
  }

  return date!;
}

function normalizeCopyrightLink(link?: string): string | undefined {
  if (!link) {
    return undefined;
  }

  return link.startsWith("http") ? link : `https://www.bing.com${link}`;
}

function buildImageUrl(url: string, resolution: Resolution): string {
  const normalizedUrl = url.startsWith("http") ? url : `https://www.bing.com${url}`;

  if (resolution === DEFAULT_RESOLUTION) {
    return normalizedUrl;
  }

  return normalizedUrl.replace(/1920x1080/, resolution);
}

function buildCacheKey(params: {
  market: Market;
  resolution: Resolution;
  timezone?: string;
  calculatedIndex: number;
  targetDate: dayjs.Dayjs;
}): string {
  return JSON.stringify({
    market: params.market,
    resolution: params.resolution,
    timezone: params.timezone ?? null,
    calculatedIndex: params.calculatedIndex,
    targetDate: params.targetDate.format("YYYY-MM-DD"),
  });
}

function canUseBackupSource(params: { calculatedIndex: number; market: Market }): boolean {
  return params.calculatedIndex === 0 && params.market === DEFAULT_MARKET;
}

function toWallpaperData(
  image: BingApiResponse["images"][number],
  resolution: Resolution,
  fallbackDate: string
): BingWallpaperData {
  return {
    url: buildImageUrl(image.url, resolution),
    title: image.title || "必应每日壁纸",
    copyright: image.copyright || "",
    copyrightlink: normalizeCopyrightLink(image.copyrightlink),
    startdate: image.startdate || fallbackDate,
    urlbase: image.urlbase || "",
  };
}

/** 带超时的 fetch 函数 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new BingWallpaperError("请求超时", "REQUEST_TIMEOUT");
    }
    throw error;
  } finally {
    clearTimeout(id);
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
  const { date, timezone, resolution = DEFAULT_RESOLUTION, market = DEFAULT_MARKET, index = 0 } =
    options;

  if (date !== undefined && index !== 0) {
    throw new BingWallpaperError("date 和 index 不能同时使用", "CONFLICTING_OPTIONS");
  }

  if (!Number.isInteger(index) || index < 0 || index > MAX_INDEX) {
    throw new BingWallpaperError(`索引必须在 0-7 之间，当前值: ${index}`, "INVALID_INDEX");
  }

  if (resolution && !isValidResolution(resolution)) {
    throw new BingWallpaperError(`不支持的分辨率: ${resolution}`, "INVALID_RESOLUTION");
  }

  if (market && !isValidMarket(market)) {
    throw new BingWallpaperError(`不支持的市场区域: ${market}`, "INVALID_MARKET");
  }

  if (timezone && !isValidTimezone(timezone)) {
    throw new BingWallpaperError(`无效的时区: ${timezone}`, "INVALID_TIMEZONE");
  }

  let targetDate: dayjs.Dayjs;

  if (date) {
    targetDate = parseTargetDate(date, timezone);
    if (!targetDate.isValid()) {
      throw new BingWallpaperError("无效的日期格式", "INVALID_DATE");
    }
  } else {
    targetDate = getNow(timezone);
  }

  let calculatedIndex = index;
  if (date) {
    const today = getNow(timezone);
    calculatedIndex = today.startOf("day").diff(targetDate.startOf("day"), "day");

    if (calculatedIndex < 0 || calculatedIndex > MAX_INDEX) {
      throw new BingWallpaperError(
        `索引超出范围，仅支持0-7之间的值，当前值: ${calculatedIndex}`,
        "INDEX_OUT_OF_RANGE"
      );
    }
  }

  const cacheKey = buildCacheKey({
    market,
    resolution,
    timezone,
    calculatedIndex,
    targetDate,
  });
  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  try {
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

    const result = toWallpaperData(image, resolution, targetDate.format("YYYYMMDD"));

    cache.set(cacheKey, result);

    return result;
  } catch (error) {
    if (!canUseBackupSource({ calculatedIndex, market })) {
      if (error instanceof BingWallpaperError) {
        throw error;
      }

      throw new BingWallpaperError(
        `获取必应壁纸失败: ${error instanceof Error ? error.message : "未知错误"}`,
        "FETCH_FAILED"
      );
    }

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
        url: buildImageUrl(data.url || "", resolution),
        title: data.title || "必应每日壁纸",
        copyright: data.copyright || "",
        copyrightlink: normalizeCopyrightLink(data.copyrightlink),
        startdate: data.startdate || getNow(timezone).format("YYYYMMDD"),
        urlbase: data.urlbase || "",
      };

      cache.set(cacheKey, result);

      return result;
    } catch {
      if (error instanceof BingWallpaperError) {
        throw error;
      }

      throw new BingWallpaperError(
        `获取必应壁纸失败: ${error instanceof Error ? error.message : "未知错误"}`,
        "FETCH_FAILED"
      );
    }
  }
}

export function clearBingWallpaperCache(): void {
  cache.clear();
}

export default getBingWallpaper;
