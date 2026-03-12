import dayjs from "dayjs";

export interface BingWallpaperData {
  /** 壁纸的 URL 链接 */
  url: string;
  /** 壁纸标题 */
  title: string;
  /** 版权信息 */
  copyright: string;
  /** 版权链接 */
  copyrightlink?: string;
  /** 日期，格式为 YYYYMMDD */
  startdate: string;
  /** URL 基础路径 */
  urlbase: string;
}

export interface BingWallpaperOptions {
  /** 日期，可以是 Date、dayjs 对象或日期字符串 */
  date?: Date | dayjs.Dayjs | string;
  /** IANA 时区，例如 Asia/Shanghai */
  timezone?: string;
  /** 壁纸分辨率，默认 1920x1080 */
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
  /** 市场区域，默认 zh-CN */
  market?:
    | "zh-CN"
    | "en-US"
    | "ja-JP"
    | "en-AU"
    | "en-GB"
    | "de-DE"
    | "en-NZ"
    | "en-CA";
  /** 壁纸索引，0 表示今天，1 表示昨天 */
  index?: number;
}

export declare class BingWallpaperError extends Error {
  code?: string;
  constructor(message: string, code?: string);
}

export declare function getBingWallpaper(
  options?: BingWallpaperOptions
): Promise<BingWallpaperData>;

export declare function clearBingWallpaperCache(): void;

export { getBingWallpaper as default };
