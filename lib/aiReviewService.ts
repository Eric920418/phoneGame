import OpenAI from "openai";
import { prisma } from "@/graphql/prismaClient";

const OPENAI_TIMEOUT = 30000; // 30 秒超時

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: OPENAI_TIMEOUT, // 添加超時設置
  maxRetries: 2, // 最多重試 2 次
});

// 中文玩家名稱池 - 更自然的網名
const CHINESE_NAMES = [
  "龍騰虎躍", "劍指蒼穹", "風雲再起", "霸氣側漏", "一劍封喉",
  "無敵小可愛", "暗夜刺客", "王者歸來", "傳說玩家", "絕地求生",
  "遊戲達人", "超級玩家", "電競高手", "戰神附體", "天選之人",
  "星辰大海", "夢想起航", "青春無悔", "熱血江湖", "武林盟主",
  "江湖俠客", "仗劍天涯", "浪跡天涯", "獨孤求敗", "笑傲江湖",
  "風華絕代", "傾城一笑", "絕世無雙", "萬里無雲", "青山綠水",
  "明月清風", "星河璀璨", "夢幻西遊", "熱血傳奇", "魔獸達人",
  "三國無雙", "蜀漢丞相", "江東霸主", "魏武帝曹", "赤壁英雄",
  "五虎將軍", "臥龍鳳雛", "虎牢戰神", "長坂勇將", "草船借箭",
  "小明愛玩遊戲", "阿傑遊戲日記", "遊戲宅男", "氪金戰士", "佛系玩家",
  "深夜肝帝", "週末戰士", "上班摸魚王", "手遊愛好者", "策略遊戲迷"
];

// 頭像池
const AVATARS = [
  "🎮", "⚔️", "🏆", "👑", "🔥", "⭐", "💎", "🎯", "🚀", "💪",
  "🌟", "🎪", "🎲", "🃏", "🎰", "🏅", "🥇", "🎖️", "👾", "🤖",
  "🐉", "🦁", "🐯", "🦅", "🗡️", "🛡️", "⚡", "🔱", "👹", "🎭"
];

// 評論口吻模板 - 讓 AI 模仿不同類型玩家
const REVIEW_PERSONAS = [
  {
    type: "老玩家",
    style: "從開服就開始玩了，經歷過很多版本更新",
    tone: "經驗豐富、見多識廣、對遊戲有深厚感情"
  },
  {
    type: "新手玩家",
    style: "剛玩一兩個月，正在探索遊戲",
    tone: "充滿新鮮感、容易被驚艷、提問較多"
  },
  {
    type: "課金玩家",
    style: "有花錢支持遊戲，體驗過 VIP 內容",
    tone: "對遊戲品質有要求、認為物有所值"
  },
  {
    type: "休閒玩家",
    style: "上班族，只有空閒時間玩一下",
    tone: "輕鬆隨意、喜歡不肝的遊戲節奏"
  },
  {
    type: "公會玩家",
    style: "加入了公會，喜歡團隊合作",
    tone: "強調社交、團隊配合、公會活動"
  },
  {
    type: "PVP愛好者",
    style: "喜歡競技對戰，追求排名",
    tone: "競爭意識強、關注平衡性、追求技術"
  }
];

// 帶超時的 Promise 封裝
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

const DB_TIMEOUT = 10000; // 10 秒數據庫超時

// 從資料庫獲取最新內容
async function getLatestContent() {
  try {
    // 獲取最新公告（帶超時）
    const announcements = await withTimeout(
      prisma.announcement.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' },
        take: 5,
        select: { title: true, excerpt: true, type: true }
      }),
      DB_TIMEOUT,
      '獲取公告超時'
    );

    // 獲取內容區塊（帶超時）
    const contentBlocks = await withTimeout(
      prisma.contentBlock.findMany({
        select: { key: true, payload: true }
      }),
      DB_TIMEOUT,
      '獲取內容區塊超時'
    );

    // 解析內容區塊
    const parsedBlocks: Record<string, unknown> = {};
    contentBlocks.forEach(block => {
      parsedBlocks[block.key] = block.payload;
    });

    return {
      announcements,
      contentBlocks: parsedBlocks
    };
  } catch (error) {
    console.error("獲取資料庫內容失敗:", error);
    return { announcements: [], contentBlocks: {} };
  }
}

// 從資料庫內容區塊提取遊戲資訊
function extractGameInfo(contentBlocks: Record<string, unknown>) {
  const info: string[] = [];

  // 提取活動公告
  if (contentBlocks.eventAnnouncements && Array.isArray(contentBlocks.eventAnnouncements)) {
    const events = contentBlocks.eventAnnouncements as Array<{ title: string; date: string }>;
    if (events.length > 0) {
      info.push("【最新活動】");
      events.slice(0, 3).forEach(e => info.push(`- ${e.title}（${e.date}）`));
    }
  }

  // 提取副本資訊
  if (contentBlocks.dungeons && Array.isArray(contentBlocks.dungeons)) {
    const dungeons = contentBlocks.dungeons as Array<{ name: string; boss: string; level: number }>;
    if (dungeons.length > 0) {
      info.push("\n【副本挑戰】");
      dungeons.forEach(d => info.push(`- ${d.name}（Lv.${d.level}）- BOSS: ${d.boss}`));
    }
  }

  // 提取 BOSS 資訊
  if (contentBlocks.bossList && Array.isArray(contentBlocks.bossList)) {
    const bosses = contentBlocks.bossList as Array<{ name: string; title: string; location: string }>;
    if (bosses.length > 0) {
      info.push("\n【知名 BOSS】");
      bosses.forEach(b => info.push(`- ${b.name}「${b.title}」- ${b.location}`));
    }
  }

  // 提取掉落資訊
  if (contentBlocks.dropItems && Array.isArray(contentBlocks.dropItems)) {
    const drops = contentBlocks.dropItems as Array<{ name: string; rarity: string; rate: string }>;
    if (drops.length > 0) {
      info.push("\n【稀有掉落】");
      drops.forEach(d => info.push(`- ${d.name}（${d.rarity}，${d.rate}掉率）`));
    }
  }

  // 提取贊助方案
  if (contentBlocks.sponsorPlans && Array.isArray(contentBlocks.sponsorPlans)) {
    const plans = contentBlocks.sponsorPlans as Array<{ name: string; benefits: string[] }>;
    if (plans.length > 0) {
      info.push("\n【贊助福利】");
      plans.slice(0, 2).forEach(p => info.push(`- ${p.name}方案：${p.benefits.slice(0, 2).join('、')}`));
    }
  }

  // 提取擂台排行
  if (contentBlocks.arenaRanking && Array.isArray(contentBlocks.arenaRanking)) {
    const ranking = contentBlocks.arenaRanking as Array<{ name: string; guild: string }>;
    if (ranking.length > 0) {
      info.push("\n【武魂擂台高手】");
      ranking.slice(0, 3).forEach((r, i) => info.push(`- 第${i + 1}名：${r.name}（${r.guild}）`));
    }
  }

  return info.join('\n');
}

// 生成隨機遊戲時數 (根據玩家類型調整)
function generateGameHours(personaType: string): number {
  switch (personaType) {
    case "老玩家":
      return Math.floor(Math.random() * 3000) + 1000; // 1000-4000小時
    case "新手玩家":
      return Math.floor(Math.random() * 100) + 10; // 10-110小時
    case "課金玩家":
      return Math.floor(Math.random() * 2000) + 500; // 500-2500小時
    case "休閒玩家":
      return Math.floor(Math.random() * 300) + 50; // 50-350小時
    case "公會玩家":
      return Math.floor(Math.random() * 1500) + 300; // 300-1800小時
    case "PVP愛好者":
      return Math.floor(Math.random() * 2000) + 400; // 400-2400小時
    default:
      return Math.floor(Math.random() * 1000) + 100;
  }
}

// 創建 AI 虛擬用戶
async function getOrCreateAIUser(persona: typeof REVIEW_PERSONAS[0]): Promise<number> {
  const randomName = CHINESE_NAMES[Math.floor(Math.random() * CHINESE_NAMES.length)];
  const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const randomSuffix = Math.floor(Math.random() * 9999);
  const email = `ai_${Date.now()}_${randomSuffix}@kingdoms.ai`;

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: "AI_USER_NO_LOGIN",
      name: `${randomName}${randomSuffix}`,
      avatar: randomAvatar,
      gameHours: generateGameHours(persona.type),
      isVerified: true,
    },
  });

  return user.id;
}

// 使用 OpenAI 根據網站內容和資料庫資料生成擬人化評論
async function generateReviewContent(dbContent: Awaited<ReturnType<typeof getLatestContent>>): Promise<{
  content: string;
  rating: number;
  isRecommended: boolean;
  persona: typeof REVIEW_PERSONAS[0];
}> {
  // 隨機選擇一個玩家類型
  const persona = REVIEW_PERSONAS[Math.floor(Math.random() * REVIEW_PERSONAS.length)];

  // 準備公告資訊（從資料庫讀取）
  const announcementInfo = dbContent.announcements.length > 0
    ? dbContent.announcements.map(a => `- ${a.title}`).join('\n')
    : "";

  // 從資料庫內容區塊提取動態遊戲資訊
  const dynamicGameInfo = extractGameInfo(dbContent.contentBlocks);

  // 準備遊戲內容資訊（基礎資訊 + 資料庫動態內容）
  const gameFeatures = `
【遊戲名稱】破浪三國
【遊戲類型】三國題材策略手遊

【核心玩法】
- 武將養成：收集培養各種三國武將
- 國戰系統：週六日 19:00-22:00 開放大規模國戰
- 三大陣營：魏國、蜀國、吳國
- 副本挑戰：虎牢關、赤壁之戰、五丈原、長坂坡
- 武魂擂台：PVP 競技排位賽

${dynamicGameInfo ? `【從官網讀取的最新內容】\n${dynamicGameInfo}` : ""}

${announcementInfo ? `【最新公告】\n${announcementInfo}` : ""}
`.trim();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `你現在要扮演一個真實的遊戲玩家，為「破浪三國」寫一條正面評價。

【你的玩家設定】
類型：${persona.type}
背景：${persona.style}
說話風格：${persona.tone}

【遊戲資訊】
${gameFeatures}

【寫評價的要求】
1. 必須非常擬人化，像真實玩家在論壇或 App Store 留言
2. 可以使用口語化表達，例如「真的很讚」「玩到停不下來」「強推」等
3. 可以加入一些個人經歷，例如「昨天打虎牢關終於拿到赤兔馬」
4. 可以提到遊戲的具體內容（BOSS、副本、武將等）
5. 整體是正面推薦的，但可以輕描淡寫提一個小缺點顯得更真實
6. 長度 80-200 字
7. 使用繁體中文
8. 可以用一些表情符號但不要太多（0-2個）
9. 評分給 4 或 5 星

【避免】
- 過於官方或廣告腔調
- 不自然的誇獎
- 太長或太短
- 提到「AI」或「生成」等字眼

請以 JSON 格式回覆：
{
  "content": "評價內容",
  "rating": 4 或 5,
  "isRecommended": true
}`
      },
      {
        role: "user",
        content: `請以「${persona.type}」的身份，根據遊戲內容寫一條自然的正面評價。記住要擬人化，像真的玩家在寫評論。`
      }
    ],
    temperature: 1.0, // 提高創意度
    max_tokens: 600,
    response_format: { type: "json_object" },
  });

  const responseText = completion.choices[0]?.message?.content || "";

  try {
    const parsed = JSON.parse(responseText);
    return {
      content: parsed.content || "這遊戲真的很好玩，停不下來！強推給三國迷",
      rating: Math.min(5, Math.max(4, parsed.rating || 5)),
      isRecommended: true,
      persona,
    };
  } catch {
    return {
      content: "玩了一個月了，真的是很棒的三國手遊！國戰超刺激，跟公會兄弟一起打超熱血的。武將收集也很有成就感，推薦給喜歡三國的朋友！",
      rating: 5,
      isRecommended: true,
      persona,
    };
  }
}

// 主函數：生成 AI 評論
export async function generateAIReview(): Promise<{
  success: boolean;
  reviewId?: number;
  error?: string;
}> {
  try {
    // 1. 從資料庫獲取最新內容
    const dbContent = await getLatestContent();

    // 2. 使用 OpenAI 生成擬人化評論
    const reviewData = await generateReviewContent(dbContent);

    // 3. 獲取或創建 AI 用戶（根據玩家類型設定遊戲時數）
    const userId = await getOrCreateAIUser(reviewData.persona);

    // 4. 創建評論（自動審核通過）
    const review = await prisma.review.create({
      data: {
        content: reviewData.content,
        rating: reviewData.rating,
        isRecommended: reviewData.isRecommended,
        userId,
        isApproved: true,
      },
    });

    console.log(`[AI Review] 成功生成 ${reviewData.persona.type} 評論 #${review.id}`);

    return {
      success: true,
      reviewId: review.id,
    };
  } catch (error) {
    console.error("生成 AI 評論失敗:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// 批量生成多條評論
export async function generateMultipleAIReviews(count: number = 1): Promise<{
  success: boolean;
  generated: number;
  errors: string[];
}> {
  const results: { success: boolean; reviewId?: number; error?: string }[] = [];

  for (let i = 0; i < count; i++) {
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
    }

    const result = await generateAIReview();
    results.push(result);
  }

  return {
    success: results.every(r => r.success),
    generated: results.filter(r => r.success).length,
    errors: results.filter(r => !r.success).map(r => r.error || "Unknown error"),
  };
}
