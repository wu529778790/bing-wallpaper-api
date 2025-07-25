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
export async function getBingWallpaper(
  options: BingWallpaperOptions = {}
): Promise<BingWallpaperData> {
  const {
    date,
    resolution = "1920x1080",
    market = "zh-CN",
    index = 0,
  } = options;

  let targetDate: dayjs.Dayjs;

  // 处理日期参数
  if (date) {
    if (typeof date === "string") {
      targetDate = dayjs(date);
    } else if (date instanceof Date) {
      targetDate = dayjs(date);
    } else {
      targetDate = date; // dayjs 对象
    }
  } else {
    targetDate = dayjs();
  }

  // 如果指定了日期，计算与今天的差值作为index
  let calculatedIndex = index;
  if (date) {
    const today = dayjs();
    calculatedIndex = today.diff(targetDate, "day");
  }

  try {
    // 使用必应官方的API端点
    const apiUrl = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=${calculatedIndex}&n=1&mkt=${market}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.images || data.images.length === 0) {
      throw new Error("没有找到壁纸数据");
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

    return {
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
  } catch (error) {
    // 如果官方API失败，尝试备用API
    try {
      const backupUrl = "https://bingw.jasonzeng.dev/?format=json";
      const response = await fetch(backupUrl);

      if (!response.ok) {
        throw new Error(`Backup API error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        url: data.url || "",
        title: data.title || "必应每日壁纸",
        copyright: data.copyright || "",
        copyrightlink: undefined,
        startdate: data.startdate || dayjs().format("YYYYMMDD"),
        urlbase: data.urlbase || "",
      };
    } catch (backupError) {
      throw new Error(
        `获取必应壁纸失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    }
  }
}

// 默认导出主函数
export default getBingWallpaper;
