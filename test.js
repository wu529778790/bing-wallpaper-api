import { getBingWallpaper } from "./dist/bing-wallpaper-api.es.js";

async function test() {
  console.log("🎯 开始测试必应壁纸包...\n");

  try {
    // 测试获取今日壁纸
    console.log("1️⃣ 测试获取今日壁纸:");
    const todayWallpaper = await getBingWallpaper();
    console.log("✅ 今日壁纸:", {
      title: todayWallpaper.title,
      url: todayWallpaper.url.substring(0, 100) + "...",
      copyright: todayWallpaper.copyright.substring(0, 50) + "...",
      startdate: todayWallpaper.startdate,
    });
    console.log("");

    // 测试获取指定日期的壁纸
    console.log("2️⃣ 测试获取昨天的壁纸:");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayWallpaper = await getBingWallpaper({ date: yesterday });
    console.log("✅ 昨天的壁纸:", {
      title: yesterdayWallpaper.title,
      url: yesterdayWallpaper.url.substring(0, 100) + "...",
      copyright: yesterdayWallpaper.copyright.substring(0, 50) + "...",
      startdate: yesterdayWallpaper.startdate,
    });
    console.log("");

    // 测试不同分辨率
    console.log("3️⃣ 测试不同分辨率 (UHD):");
    const uhdWallpaper = await getBingWallpaper({ resolution: "UHD" });
    console.log("✅ UHD壁纸:", {
      title: uhdWallpaper.title,
      url: uhdWallpaper.url.substring(0, 100) + "...",
      startdate: uhdWallpaper.startdate,
    });
    console.log("");

    // 测试使用索引获取历史壁纸
    console.log("4️⃣ 测试使用索引获取前天的壁纸:");
    const dayBeforeWallpaper = await getBingWallpaper({ index: 2 });
    console.log("✅ 前天的壁纸:", {
      title: dayBeforeWallpaper.title,
      url: dayBeforeWallpaper.url.substring(0, 100) + "...",
      copyright: dayBeforeWallpaper.copyright.substring(0, 50) + "...",
      startdate: dayBeforeWallpaper.startdate,
    });
    console.log("");

    console.log("🎉 所有测试通过！");
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
    process.exit(1);
  }
}

test();
