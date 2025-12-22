import OpenAI from "openai";
import { prisma } from "@/graphql/prismaClient";

const OPENAI_TIMEOUT = 30000; // 30 秒超時

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: OPENAI_TIMEOUT,
  maxRetries: 2,
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

// 評論口吻模板 - 復古 MMORPG 老玩家風格
const REVIEW_PERSONAS = [
  {
    type: "打王老手",
    style: "喜歡打王掉寶的老玩家",
    tone: "有打王經驗、對掉寶機制有感"
  },
  {
    type: "復古情懷玩家",
    style: "懷念以前群英Online的老玩家",
    tone: "有懷舊情懷、喜歡原味玩法"
  },
  {
    type: "公平黨",
    style: "討厭P2W、喜歡公平競爭",
    tone: "關注公平性、不吃課金"
  },
  {
    type: "社交玩家",
    style: "喜歡跟人互動、參與國戰",
    tone: "享受社交、國戰對抗"
  },
  {
    type: "練功控",
    style: "享受角色成長的玩家",
    tone: "關注練功節奏、升等體驗"
  },
  {
    type: "裝備控",
    style: "喜歡打裝、強化裝備的玩家",
    tone: "關注裝備取得、強化系統"
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

// 資料型別定義
interface SponsorPlan {
  name: string;
  price: number;
  benefits: string[];
}

interface DropItem {
  boss: string;
  location: string;
  category?: string;
  drops: { name: string }[];
}

interface Monster {
  name: string;
  drops: string[];
}

interface Dungeon {
  name: string;
  cooldown?: string;
  dungeonTime?: string;
  players: string;
  monsters?: Monster[];
}

interface TreasureBox {
  name: string;
  items: string[];
}

interface WarScheduleItem {
  day: string;
  time: string;
  type: string;
}

interface NationWarData {
  rules?: { title: string; items: string[] }[];
  rewards?: { rank: string; items: string[] }[];
}

interface RankingPlayer {
  rank: number;
  name: string;
  guild: string;
  score: number;
}

interface ArenaRanking {
  levelRanking?: RankingPlayer[];
  nationWarRanking?: RankingPlayer[];
  chibiRanking?: RankingPlayer[];
}

interface GuideItem {
  chapter: number;
  title: string;
  desc: string;
}

interface SettingsCategory {
  category?: string;
  name?: string;
  settings: { name: string; value?: string }[];
}

interface DownloadData {
  downloads: { name: string; version: string; size: string }[];
  patches: { name: string; date: string; description: string }[];
}

interface Faction {
  name: string;
  leader: string;
  description: string;
  bonus: string;
}

// 從資料庫獲取所有內容
async function getAllContent() {
  try {
    // 並行獲取所有內容區塊
    const [announcements, contentBlocks] = await Promise.all([
      // 獲取最新公告
      withTimeout(
        prisma.announcement.findMany({
          where: { isPublished: true },
          orderBy: { publishedAt: 'desc' },
          take: 5,
          select: { title: true, excerpt: true, type: true }
        }),
        DB_TIMEOUT,
        '獲取公告超時'
      ),
      // 獲取所有內容區塊
      withTimeout(
        prisma.contentBlock.findMany({
          select: { key: true, payload: true }
        }),
        DB_TIMEOUT,
        '獲取內容區塊超時'
      )
    ]);

    // 解析內容區塊
    const blocks: Record<string, unknown> = {};
    contentBlocks.forEach(block => {
      blocks[block.key] = block.payload;
    });

    return { announcements, blocks };
  } catch (error) {
    console.error("獲取資料庫內容失敗:", error);
    return { announcements: [], blocks: {} };
  }
}

// 從資料庫內容區塊提取遊戲資訊
function extractGameInfo(blocks: Record<string, unknown>) {
  const info: string[] = [];

  // 1. 贊助方案
  const sponsorPlans = blocks.sponsorPlans as SponsorPlan[] | undefined;
  if (sponsorPlans && Array.isArray(sponsorPlans) && sponsorPlans.length > 0) {
    info.push("【贊助方案】");
    sponsorPlans.slice(0, 3).forEach(p => {
      info.push(`- ${p.name}（NT$${p.price}）：${(p.benefits || []).slice(0, 2).join('、')}`);
    });
  }

  // 2. 掉落查詢
  const dropItems = blocks.dropItems as DropItem[] | undefined;
  if (dropItems && Array.isArray(dropItems) && dropItems.length > 0) {
    info.push("\n【怪物掉落】");
    // 取幾個有代表性的怪物
    const sampleDrops = dropItems.slice(0, 5);
    sampleDrops.forEach(d => {
      const dropNames = (d.drops || []).map(drop => drop.name).slice(0, 3).join('、');
      info.push(`- ${d.boss}（${d.location}）：${dropNames}`);
    });
  }

  // 3. 副本介紹
  const dungeons = blocks.dungeons as Dungeon[] | undefined;
  if (dungeons && Array.isArray(dungeons) && dungeons.length > 0) {
    info.push("\n【副本介紹】");
    dungeons.forEach(d => {
      const details: string[] = [];
      if (d.players) details.push(`${d.players}人`);
      if (d.cooldown) details.push(`間隔${d.cooldown}`);
      if (d.dungeonTime) details.push(`時間${d.dungeonTime}`);
      info.push(`- ${d.name}（${details.join('，')}）`);
      if (d.monsters && d.monsters.length > 0) {
        const bossNames = d.monsters.map(m => m.name).join('、');
        info.push(`  BOSS：${bossNames}`);
      }
    });
  }

  // 4. 寶箱福袋內容
  const treasureBoxes = blocks.treasureBoxes as TreasureBox[] | undefined;
  if (treasureBoxes && Array.isArray(treasureBoxes) && treasureBoxes.length > 0) {
    info.push("\n【寶箱福袋】");
    treasureBoxes.slice(0, 3).forEach(box => {
      const items = (box.items || []).slice(0, 3).join('、');
      info.push(`- ${box.name}：${items}...`);
    });
  }

  // 5. 國戰時間
  const warSchedule = blocks.warSchedule as WarScheduleItem[] | undefined;
  if (warSchedule && Array.isArray(warSchedule) && warSchedule.length > 0) {
    info.push("\n【國戰時間】");
    warSchedule.forEach(w => {
      info.push(`- ${w.day} ${w.time} - ${w.type}`);
    });
  }

  // 6. 國戰規則與獎勵
  const nationWar = blocks.nationWar as NationWarData | undefined;
  if (nationWar) {
    if (nationWar.rewards && nationWar.rewards.length > 0) {
      info.push("\n【國戰獎勵】");
      nationWar.rewards.slice(0, 3).forEach(r => {
        info.push(`- ${r.rank}：${(r.items || []).slice(0, 2).join('、')}`);
      });
    }
  }

  // 7. 三國陣營
  const factions = blocks.factions as Faction[] | undefined;
  if (factions && Array.isArray(factions) && factions.length > 0) {
    info.push("\n【三國陣營】");
    factions.forEach(f => {
      info.push(`- ${f.name}：${f.description}${f.bonus ? `（${f.bonus}）` : ''}`);
    });
  }

  // 8. 三國排行
  const arenaRanking = blocks.arenaRanking as ArenaRanking | undefined;
  if (arenaRanking) {
    const topPlayers: string[] = [];
    if (arenaRanking.levelRanking && arenaRanking.levelRanking.length > 0) {
      const top = arenaRanking.levelRanking[0];
      topPlayers.push(`等級榜首：${top.name}（Lv.${top.score}）`);
    }
    if (arenaRanking.nationWarRanking && arenaRanking.nationWarRanking.length > 0) {
      const top = arenaRanking.nationWarRanking[0];
      topPlayers.push(`國戰榜首：${top.name}（${top.score}討敵）`);
    }
    if (topPlayers.length > 0) {
      info.push("\n【三國排行】");
      topPlayers.forEach(p => info.push(`- ${p}`));
    }
  }

  // 9. 新手攻略
  const beginnerGuides = blocks.beginnerGuides as GuideItem[] | undefined;
  if (beginnerGuides && Array.isArray(beginnerGuides) && beginnerGuides.length > 0) {
    info.push("\n【新手攻略章節】");
    beginnerGuides.slice(0, 3).forEach(g => {
      info.push(`- 第${g.chapter}章：${g.title}`);
    });
  }

  // 10. 遊戲設定（快捷鍵）
  const gameSettings = blocks.gameSettings as SettingsCategory[] | undefined;
  if (gameSettings && Array.isArray(gameSettings) && gameSettings.length > 0) {
    info.push("\n【遊戲快捷鍵】");
    const allSettings = gameSettings.flatMap(g => g.settings || []).slice(0, 5);
    allSettings.forEach(s => {
      info.push(`- ${s.name}：${s.value || ''}`);
    });
  }

  // 11. 下載專區
  const downloadCenter = blocks.downloadCenter as DownloadData | undefined;
  if (downloadCenter) {
    if (downloadCenter.downloads && downloadCenter.downloads.length > 0) {
      info.push("\n【下載專區】");
      downloadCenter.downloads.forEach(d => {
        info.push(`- ${d.name}（${d.version}，${d.size}）`);
      });
    }
    if (downloadCenter.patches && downloadCenter.patches.length > 0) {
      info.push("最新補丁：");
      downloadCenter.patches.slice(0, 2).forEach(p => {
        info.push(`- ${p.name}（${p.date}）：${p.description}`);
      });
    }
  }

  return info.join('\n');
}

// 生成遊戲時數
function generateGameHours(_personaType: string): number {
  // 復古服玩家有一定遊戲時數
  return Math.floor(Math.random() * 200) + 50;
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
async function generateReviewContent(dbContent: Awaited<ReturnType<typeof getAllContent>>): Promise<{
  content: string;
  rating: number;
  isRecommended: boolean;
  persona: typeof REVIEW_PERSONAS[0];
}> {
  // 隨機選擇一個玩家類型
  const persona = REVIEW_PERSONAS[Math.floor(Math.random() * REVIEW_PERSONAS.length)];

  // 準備公告資訊
  const announcementInfo = dbContent.announcements.length > 0
    ? dbContent.announcements.map(a => `- ${a.title}`).join('\n')
    : "";

  // 從資料庫內容區塊提取動態遊戲資訊
  const dynamicGameInfo = extractGameInfo(dbContent.blocks);

  // 隨機選擇一個評論句型（正式服玩家視角）
  const SENTENCE_STARTERS = [
    "玩了一段時間，整體感覺是",
    "開服到現在玩下來，最有感的是",
    "我玩過不少私服，這服",
    "回鍋群英選了這服，",
    "說說這陣子的體驗，",
    "玩了幾週，簡單分享一下，",
    "老玩家回來玩，發現這服",
    ""
  ];
  const sentenceStarter = SENTENCE_STARTERS[Math.floor(Math.random() * SENTENCE_STARTERS.length)];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `你正在評論的遊戲是《三國群英傳 Online》私服，屬於「復古 MMORPG」，不是卡牌遊戲，也不是收集武將類型遊戲。

本遊戲核心特色如下：
1. 玩家只操作「一名主角色」，沒有收集武將系統。
2. 遊戲重點在於：
   - 打王（BOSS 掉落）
   - 練功與角色成長
   - 裝備取得與強化
   - 國戰、赤壁戰場對抗
   - 技能搭配與操作節奏
3. 遊戲風格偏向：
   - 老玩家情懷
   - 高自由度
   - 不追求自動化或課金即勝
4. 本服為「復古服」，強調：
   - 原味玩法
   - 公平性
   - 打寶與時間投入的成就感
5. 請避免提及：
   - 抽卡
   - 收集武將
   - 放置玩法
   - 卡牌養成

你的身份設定：
你是一名《三國群英傳 Online》的老玩家，
曾經玩過官方版本，也玩過其他私服。
「破浪三國」這個復古私服已經正式開服，你已經實際遊玩了一段時間，
現在正在分享你的真實遊戲體驗與感受。

【你的玩家類型】
類型：${persona.type}
背景：${persona.style}
說話風格：${persona.tone}

【從官網讀取的最新內容】
${dynamicGameInfo}

${announcementInfo ? `【最新公告】\n${announcementInfo}` : ""}

你的評論角度是：
- 已經實際玩過一段時間的玩家視角
- 非官方宣傳，是真實玩家的體驗分享
- 像在社群或官網留言區分享真實感受
- 可以提到優點，也可以提到小缺點或建議（讓評論更真實）
- 語氣自然、不過度誇張、不像廣告

評論內容請優先圍繞以下主題（任選1~2點）：
1. 打王與掉寶的感受
2. 練功節奏是否順暢
3. 裝備取得的成就感
4. 復古玩法帶來的情懷
5. 玩家之間的互動或國戰氛圍
6. 服主或官方是否重視遊戲體驗

請避免：
- 講教學
- 講功能列表
- 講未實際體驗過的內容
- 使用任何表情符號（emoji）

【重要！寫評論的要求】
1. 字數要短！控制在 30-80 字左右
2. 語氣自然，像真實玩家留言
3. 可以根據官網內容提到具體的BOSS名稱、副本名稱、裝備等
4. 不要使用任何表情符號（emoji）

${sentenceStarter ? `【建議開頭句型】\n「${sentenceStarter}……」` : ""}

示範評論風格（正面為主，偶爾帶小建議會更真實）：
- 「玩了快兩週，打王掉寶的感覺找回來了，看到紫裝掉的時候還是會緊張一下。」
- 「這服不像其他私服一堆商城按鈕，玩起來清爽很多，裝備慢慢打反而有成就感。」
- 「國戰打起來蠻熱鬧的，雖然有時候會卡一下，但整體算順。」
- 「練功點常遇到老玩家，偶爾會聊以前群英的事，這種氛圍現在很少見了。」
- 「前期練等節奏OK，中後期會有點肝，但復古服本來就這樣。」
- 「開服到現在都蠻穩的，GM有在處理問題，這點給好評。」
- 「整體還不錯，就是副本冷卻時間有點長，希望之後可以調整。」
- 「老玩家回鍋很有感覺，不用課金也能玩得開心，只是人再多一點會更好。」

JSON 格式回覆（rating 可以是 3-5 分，真實評價不用都給滿分）：
{
  "content": "評論內容",
  "rating": 4,
  "isRecommended": true
}`
      },
      {
        role: "user",
        content: `以「${persona.type}」的身份，根據官網資料寫一條自然的玩家評論。記得字數要短、語氣自然！`
      }
    ],
    temperature: 1.1,
    max_tokens: 300,
    response_format: { type: "json_object" },
  });

  const responseText = completion.choices[0]?.message?.content || "";

  try {
    const parsed = JSON.parse(responseText);
    // 真實評價：允許 3-5 分，但以 4-5 分為主
    const rating = Math.min(5, Math.max(3, parsed.rating || 5));
    return {
      content: parsed.content || "復古群英玩起來就是舒服，打王有感覺，練功有節奏。",
      rating,
      isRecommended: rating >= 4,
      persona,
    };
  } catch {
    return {
      content: "這服打王掉寶的感覺找回來了，復古玩法不用一直看商城，玩得比較踏實。",
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
    const dbContent = await getAllContent();

    // 2. 使用 OpenAI 生成擬人化評論
    const reviewData = await generateReviewContent(dbContent);

    // 3. 獲取或創建 AI 用戶
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
