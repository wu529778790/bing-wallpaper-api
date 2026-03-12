import { getBingWallpaper } from "./dist/bing-wallpaper-api.js";

async function test() {
  console.log("开始测试 bing-wallpaper-api...\n");

  try {
    console.log("1. 测试获取今日壁纸:");
    const todayWallpaper = await getBingWallpaper();
    console.log("通过:", {
      title: todayWallpaper.title,
      url: todayWallpaper.url.substring(0, 100) + "...",
      copyright: todayWallpaper.copyright.substring(0, 50) + "...",
      startdate: todayWallpaper.startdate,
    });
    console.log("");

    console.log("2. 测试按日期获取壁纸:");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayWallpaper = await getBingWallpaper({ date: yesterday });
    console.log("通过:", {
      title: yesterdayWallpaper.title,
      url: yesterdayWallpaper.url.substring(0, 100) + "...",
      copyright: yesterdayWallpaper.copyright.substring(0, 50) + "...",
      startdate: yesterdayWallpaper.startdate,
    });
    console.log("");

    console.log("3. 测试不同分辨率 (UHD):");
    const uhdWallpaper = await getBingWallpaper({ resolution: "UHD" });
    console.log("通过:", {
      title: uhdWallpaper.title,
      url: uhdWallpaper.url.substring(0, 100) + "...",
      startdate: uhdWallpaper.startdate,
    });
    console.log("");

    console.log("4. 测试通过索引获取历史壁纸:");
    const dayBeforeWallpaper = await getBingWallpaper({ index: 2 });
    console.log("通过:", {
      title: dayBeforeWallpaper.title,
      url: dayBeforeWallpaper.url.substring(0, 100) + "...",
      copyright: dayBeforeWallpaper.copyright.substring(0, 50) + "...",
      startdate: dayBeforeWallpaper.startdate,
    });
    console.log("");

    console.log("所有测试通过");
  } catch (error) {
    console.error("测试失败:", error.message);
    process.exit(1);
  }
}

test();
