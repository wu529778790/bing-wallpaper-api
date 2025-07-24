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

/**
 * 获取必应每日壁纸
 * @param options 配置选项
 * @returns Promise<BingWallpaperData> 壁纸数据
 */
export declare function getBingWallpaper(
  options?: BingWallpaperOptions
): Promise<BingWallpaperData>;

/**
 * 获取今日必应壁纸（快捷方法）
 * @param resolution 壁纸分辨率
 * @returns Promise<BingWallpaperData> 壁纸数据
 */
export declare function getTodayBingWallpaper(
  resolution?: BingWallpaperOptions["resolution"]
): Promise<BingWallpaperData>;

/**
 * 获取指定日期的必应壁纸（快捷方法）
 * @param date 日期
 * @param resolution 壁纸分辨率
 * @returns Promise<BingWallpaperData> 壁纸数据
 */
export declare function getBingWallpaperByDate(
  date: Date | dayjs.Dayjs | string,
  resolution?: BingWallpaperOptions["resolution"]
): Promise<BingWallpaperData>;

export { getBingWallpaper as default };
