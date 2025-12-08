import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 新手攻略資料
const beginnerGuide = {
  chapters: [
    {
      id: 1,
      title: "開始你的三國之旅",
      icon: "User",
      color: "#3498db",
      content: [
        { subtitle: "建立角色", text: "選擇你的陣營（魏、蜀、吳）和職業，每個陣營都有獨特的背景故事和專屬武將。" },
        { subtitle: "了解介面", text: "熟悉主畫面的各個功能區塊，包括任務列表、背包、技能欄等。" },
        { subtitle: "完成新手引導", text: "跟隨引導完成初始任務，可獲得豐富的新手獎勵和基礎裝備。" },
      ],
    },
    {
      id: 2,
      title: "戰鬥系統入門",
      icon: "Swords",
      color: "#e74c3c",
      content: [
        { subtitle: "基礎操作", text: "使用 WASD 移動，滑鼠左鍵攻擊，數字鍵 1-9 釋放技能。" },
        { subtitle: "技能連招", text: "學習各職業的基礎技能組合，掌握技能施放的最佳時機。" },
        { subtitle: "閃避與防禦", text: "善用閃避技能躲避敵人的強力攻擊，減少傷害損失。" },
      ],
    },
    {
      id: 3,
      title: "探索遊戲世界",
      icon: "Map",
      color: "#2ecc71",
      content: [
        { subtitle: "主線任務", text: "跟隨主線劇情了解三國故事，解鎖新地圖和遊戲功能。" },
        { subtitle: "支線任務", text: "完成支線任務獲取額外經驗和獎勵，豐富遊戲體驗。" },
        { subtitle: "每日活動", text: "每天參與日常活動，累積資源和道具，穩定成長。" },
      ],
    },
    {
      id: 4,
      title: "加入社群",
      icon: "Users",
      color: "#9b59b6",
      content: [
        { subtitle: "加入公會", text: "尋找適合的公會加入，享受團隊福利和公會活動。" },
        { subtitle: "組隊副本", text: "與其他玩家組隊挑戰副本，獲取更好的裝備獎勵。" },
        { subtitle: "交流互動", text: "善用聊天頻道與其他玩家交流，互相學習成長。" },
      ],
    },
    {
      id: 5,
      title: "角色培養",
      icon: "TrendingUp",
      color: "#f39c12",
      content: [
        { subtitle: "裝備強化", text: "收集材料強化裝備，提升角色戰鬥力。" },
        { subtitle: "技能升級", text: "使用技能書提升技能等級，解鎖更強大的能力。" },
        { subtitle: "武將系統", text: "收集和培養武將，搭配不同的武將組合增強實力。" },
      ],
    },
  ],
  classes: [
    { name: "武將", role: "近戰輸出", difficulty: "簡單", description: "高傷害近戰職業，適合喜歡衝鋒陷陣的玩家" },
    { name: "軍師", role: "遠程法術", difficulty: "中等", description: "強力法術輸出，需要保持距離輸出傷害" },
    { name: "護衛", role: "坦克防禦", difficulty: "簡單", description: "高防禦職業，負責保護隊友承受傷害" },
    { name: "刺客", role: "爆發暗殺", difficulty: "困難", description: "高機動性職業，擅長快速擊殺敵方後排" },
    { name: "弓手", role: "遠程物理", difficulty: "中等", description: "遠程物理輸出，適合喜歡風箏打法的玩家" },
  ],
};

// 寶箱資料
const treasureBoxes = [
  {
    id: 1,
    name: "傳說寶箱",
    rarity: "傳說",
    color: "#ff6b00",
    description: "包含最稀有的傳說級獎勵",
    obtainMethod: "活動獎勵、儲值贈送",
    items: [
      { name: "赤兔馬", rate: "1%", rarity: "傳說" },
      { name: "傳說武器選擇箱", rate: "5%", rarity: "傳說" },
      { name: "傳說防具選擇箱", rate: "5%", rarity: "傳說" },
      { name: "神話材料 x5", rate: "10%", rarity: "史詩" },
      { name: "元寶 x1000", rate: "20%", rarity: "稀有" },
      { name: "經驗藥水 x10", rate: "59%", rarity: "普通" },
    ],
  },
  {
    id: 2,
    name: "史詩寶箱",
    rarity: "史詩",
    color: "#a855f7",
    description: "有機會獲得史詩級裝備",
    obtainMethod: "副本掉落、商城購買",
    items: [
      { name: "史詩武器隨機箱", rate: "3%", rarity: "史詩" },
      { name: "史詩防具隨機箱", rate: "5%", rarity: "史詩" },
      { name: "稀有材料 x10", rate: "15%", rarity: "稀有" },
      { name: "元寶 x500", rate: "20%", rarity: "稀有" },
      { name: "強化石 x5", rate: "25%", rarity: "普通" },
      { name: "銀幣 x10000", rate: "32%", rarity: "普通" },
    ],
  },
  {
    id: 3,
    name: "稀有寶箱",
    rarity: "稀有",
    color: "#3b82f6",
    description: "日常活動常見獎勵",
    obtainMethod: "每日任務、活動獎勵",
    items: [
      { name: "稀有裝備隨機箱", rate: "10%", rarity: "稀有" },
      { name: "普通材料 x20", rate: "20%", rarity: "普通" },
      { name: "元寶 x100", rate: "15%", rarity: "普通" },
      { name: "經驗藥水 x5", rate: "25%", rarity: "普通" },
      { name: "銀幣 x5000", rate: "30%", rarity: "普通" },
    ],
  },
  {
    id: 4,
    name: "普通寶箱",
    rarity: "普通",
    color: "#6b7280",
    description: "基礎獎勵寶箱",
    obtainMethod: "擊殺怪物、完成任務",
    items: [
      { name: "普通裝備", rate: "20%", rarity: "普通" },
      { name: "基礎材料 x10", rate: "30%", rarity: "普通" },
      { name: "銀幣 x1000", rate: "30%", rarity: "普通" },
      { name: "經驗藥水 x1", rate: "20%", rarity: "普通" },
    ],
  },
  {
    id: 5,
    name: "國戰寶箱",
    rarity: "史詩",
    color: "#ef4444",
    description: "國戰勝利專屬獎勵",
    obtainMethod: "國戰勝利獎勵",
    items: [
      { name: "虎符", rate: "5%", rarity: "史詩" },
      { name: "國戰專屬時裝", rate: "3%", rarity: "史詩" },
      { name: "史詩材料 x5", rate: "15%", rarity: "史詩" },
      { name: "元寶 x800", rate: "20%", rarity: "稀有" },
      { name: "榮譽點數 x500", rate: "30%", rarity: "普通" },
      { name: "銀幣 x20000", rate: "27%", rarity: "普通" },
    ],
  },
  {
    id: 6,
    name: "武魂寶箱",
    rarity: "史詩",
    color: "#f59e0b",
    description: "競技場排名獎勵",
    obtainMethod: "武魂擂台賽季獎勵",
    items: [
      { name: "武魂專屬武器", rate: "2%", rarity: "傳說" },
      { name: "競技專屬稱號", rate: "5%", rarity: "史詩" },
      { name: "技能書選擇箱", rate: "10%", rarity: "史詩" },
      { name: "元寶 x600", rate: "20%", rarity: "稀有" },
      { name: "競技點數 x300", rate: "30%", rarity: "普通" },
      { name: "強化石 x10", rate: "33%", rarity: "普通" },
    ],
  },
];

// 下載中心資料
const downloadCenter = {
  downloads: [
    {
      id: "windows",
      name: "Windows 客戶端",
      icon: "Monitor",
      version: "v2.5.3",
      size: "3.2 GB",
      description: "適用於 Windows 10/11 64位元系統",
      downloadUrl: "#",
      color: "#0078d4",
    },
    {
      id: "mac",
      name: "macOS 客戶端",
      icon: "Apple",
      version: "v2.5.3",
      size: "3.5 GB",
      description: "適用於 macOS 12.0 或更高版本",
      downloadUrl: "#",
      color: "#555555",
    },
    {
      id: "android",
      name: "Android 版本",
      icon: "Smartphone",
      version: "v2.5.3",
      size: "1.8 GB",
      description: "適用於 Android 8.0 或更高版本",
      downloadUrl: "#",
      color: "#3ddc84",
    },
    {
      id: "ios",
      name: "iOS 版本",
      icon: "Apple",
      version: "v2.5.3",
      size: "1.9 GB",
      description: "適用於 iOS 14.0 或更高版本",
      downloadUrl: "#",
      color: "#007aff",
    },
  ],
  patches: [
    {
      id: "patch-2.5.3",
      name: "更新補丁 v2.5.3",
      date: "2024-12-01",
      size: "256 MB",
      description: "修復已知問題，提升遊戲穩定性",
    },
    {
      id: "patch-2.5.2",
      name: "更新補丁 v2.5.2",
      date: "2024-11-15",
      size: "180 MB",
      description: "新增國戰系統優化",
    },
  ],
};

// 遊戲設定資料
const gameSettings = [
  {
    id: "graphics",
    name: "畫面設定",
    icon: "Monitor",
    color: "#3498db",
    settings: [
      { name: "解析度", description: "建議設定為螢幕原生解析度以獲得最佳畫質", recommended: "1920x1080" },
      { name: "畫面品質", description: "根據電腦配置選擇，建議中高配置選擇「高」", recommended: "高" },
      { name: "幀數上限", description: "建議開啟垂直同步或設定為 60 FPS 以減少畫面撕裂", recommended: "60 FPS" },
      { name: "陰影品質", description: "對效能影響較大，低配電腦建議設為「低」", recommended: "中" },
      { name: "特效品質", description: "技能特效的細緻程度，建議設為「中」以上", recommended: "高" },
    ],
  },
  {
    id: "audio",
    name: "音效設定",
    icon: "Volume2",
    color: "#2ecc71",
    settings: [
      { name: "主音量", description: "控制遊戲整體音量", recommended: "70%" },
      { name: "背景音樂", description: "遊戲背景音樂音量", recommended: "50%" },
      { name: "音效", description: "技能與環境音效音量", recommended: "80%" },
      { name: "語音", description: "角色語音與對話音量", recommended: "100%" },
    ],
  },
  {
    id: "controls",
    name: "操作設定",
    icon: "Gamepad2",
    color: "#9b59b6",
    settings: [
      { name: "鏡頭靈敏度", description: "滑鼠移動鏡頭的靈敏程度", recommended: "中" },
      { name: "技能快捷鍵", description: "可自訂技能施放的按鍵配置", recommended: "1-9 數字鍵" },
      { name: "自動攻擊", description: "是否啟用自動普攻功能", recommended: "開啟" },
      { name: "智慧施法", description: "技能是否直接對目標施放", recommended: "開啟" },
    ],
  },
  {
    id: "network",
    name: "網路設定",
    icon: "Globe",
    color: "#e74c3c",
    settings: [
      { name: "自動選擇伺服器", description: "系統自動選擇延遲最低的伺服器", recommended: "開啟" },
      { name: "顯示延遲", description: "在畫面上顯示網路延遲數值", recommended: "開啟" },
      { name: "流量優化", description: "減少數據傳輸量，適合網路不穩定時使用", recommended: "關閉" },
    ],
  },
  {
    id: "interface",
    name: "介面設定",
    icon: "Palette",
    color: "#f39c12",
    settings: [
      { name: "UI 縮放", description: "調整介面元素的大小", recommended: "100%" },
      { name: "顯示傷害數字", description: "是否顯示戰鬥傷害數值", recommended: "開啟" },
      { name: "顯示玩家名稱", description: "是否顯示其他玩家的名稱", recommended: "開啟" },
      { name: "小地圖透明度", description: "右上角小地圖的透明程度", recommended: "70%" },
    ],
  },
  {
    id: "privacy",
    name: "隱私設定",
    icon: "Shield",
    color: "#1abc9c",
    settings: [
      { name: "接受好友邀請", description: "是否允許其他玩家發送好友邀請", recommended: "開啟" },
      { name: "接受組隊邀請", description: "是否允許其他玩家發送組隊邀請", recommended: "開啟" },
      { name: "接受私訊", description: "是否允許接收私人訊息", recommended: "好友限定" },
      { name: "顯示上線狀態", description: "是否讓其他玩家看到您的上線狀態", recommended: "好友可見" },
    ],
  },
];

// 國戰資料
const nationWar = {
  warSchedule: [
    { day: "週一", time: "20:00 - 21:00", type: "練習賽", description: "無獎勵的練習戰場" },
    { day: "週二", time: "20:00 - 21:30", type: "資源戰", description: "爭奪地區資源點" },
    { day: "週三", time: "20:00 - 21:00", type: "練習賽", description: "無獎勵的練習戰場" },
    { day: "週四", time: "20:00 - 21:30", type: "城池戰", description: "攻城掠地戰役" },
    { day: "週五", time: "20:00 - 22:00", type: "公會戰", description: "公會對抗賽" },
    { day: "週六", time: "19:00 - 22:00", type: "國戰", description: "三國大規模戰役" },
    { day: "週日", time: "19:00 - 22:00", type: "國戰", description: "三國大規模戰役" },
  ],
  rules: [
    {
      title: "參戰資格",
      items: [
        "角色等級達到 30 級以上",
        "已選擇陣營（魏、蜀、吳）",
        "非新手保護期玩家",
        "建議戰力 50,000 以上",
      ],
    },
    {
      title: "戰場規則",
      items: [
        "每場國戰分為三個階段：集結期、戰鬥期、結算期",
        "戰鬥期間擊殺敵方玩家可獲得積分",
        "佔領據點可為陣營提供增益效果",
        "陣亡後 30 秒可在安全區復活",
      ],
    },
    {
      title: "勝利條件",
      items: [
        "佔領敵方主城持續 5 分鐘",
        "戰鬥時間結束時積分最高的陣營獲勝",
        "殲滅敵方總指揮（限特殊戰役）",
      ],
    },
    {
      title: "禁止行為",
      items: [
        "使用外掛或輔助程式",
        "惡意掛機或故意送分",
        "與敵方陣營玩家串通",
        "辱罵或騷擾其他玩家",
      ],
    },
  ],
  rewards: [
    { rank: "冠軍陣營", items: ["國戰寶箱 x3", "榮譽點數 x1000", "專屬稱號", "元寶 x500"] },
    { rank: "亞軍陣營", items: ["國戰寶箱 x2", "榮譽點數 x600", "元寶 x300"] },
    { rank: "季軍陣營", items: ["國戰寶箱 x1", "榮譽點數 x300", "元寶 x100"] },
    { rank: "個人 MVP", items: ["MVP 稱號", "額外榮譽點數 x500", "傳說材料 x5"] },
  ],
};

// 贊助方案資料
const sponsorPlans = [
  {
    id: "bronze",
    name: "青銅贊助",
    price: 100,
    icon: "Shield",
    color: "#cd7f32",
    benefits: [
      "專屬青銅稱號",
      "500 元寶",
      "經驗加成 10% (7天)",
      "每日簽到獎勵 x2",
    ],
  },
  {
    id: "silver",
    name: "白銀贊助",
    price: 300,
    icon: "Star",
    color: "#c0c0c0",
    benefits: [
      "專屬白銀稱號",
      "2000 元寶",
      "經驗加成 20% (15天)",
      "稀有坐騎一隻",
      "每日簽到獎勵 x3",
    ],
    popular: false,
  },
  {
    id: "gold",
    name: "黃金贊助",
    price: 500,
    icon: "Crown",
    color: "#ffd700",
    benefits: [
      "專屬黃金稱號",
      "5000 元寶",
      "經驗加成 30% (30天)",
      "傳說坐騎一隻",
      "專屬時裝套組",
      "VIP 專屬聊天頻道",
    ],
    popular: true,
  },
  {
    id: "diamond",
    name: "鑽石贊助",
    price: 1000,
    icon: "Zap",
    color: "#b9f2ff",
    benefits: [
      "專屬鑽石稱號",
      "15000 元寶",
      "經驗加成 50% (永久)",
      "神話坐騎一隻",
      "限定時裝全套",
      "專屬特效光環",
      "優先客服支援",
      "每月專屬禮包",
    ],
  },
];

// 副本資料
const dungeons = [
  {
    id: 1,
    name: "虎牢關",
    difficulty: "傳說",
    difficultyColor: "#ff6b00",
    levelRequire: 60,
    playerCount: "5人",
    timeLimit: "30分鐘",
    rewards: ["赤兔馬碎片", "傳說裝備", "稀有材料"],
    description: "面對無雙猛將呂布，挑戰三國最強戰將！",
    bosses: ["呂布"],
  },
  {
    id: 2,
    name: "赤壁之戰",
    difficulty: "史詩",
    difficultyColor: "#a855f7",
    levelRequire: 50,
    playerCount: "10人",
    timeLimit: "45分鐘",
    rewards: ["火船圖紙", "史詩裝備", "東風令"],
    description: "重現赤壁大戰，火燒連營八百里！",
    bosses: ["曹操軍團", "鐵索連環艦"],
  },
  {
    id: 3,
    name: "五丈原",
    difficulty: "史詩",
    difficultyColor: "#a855f7",
    levelRequire: 55,
    playerCount: "5人",
    timeLimit: "25分鐘",
    rewards: ["諸葛錦囊", "史詩法器", "智將令牌"],
    description: "追尋臥龍先生的最後足跡，解開智謀之謎。",
    bosses: ["司馬懿幻影", "八陣圖核心"],
  },
  {
    id: 4,
    name: "長坂坡",
    difficulty: "困難",
    difficultyColor: "#3b82f6",
    levelRequire: 40,
    playerCount: "3人",
    timeLimit: "20分鐘",
    rewards: ["趙雲槍訣", "稀有防具", "戰馬材料"],
    description: "體驗趙子龍七進七出的傳奇壯舉！",
    bosses: ["曹軍先鋒", "曹軍大將"],
  },
  {
    id: 5,
    name: "官渡之戰",
    difficulty: "困難",
    difficultyColor: "#3b82f6",
    levelRequire: 35,
    playerCount: "5人",
    timeLimit: "30分鐘",
    rewards: ["袁紹寶藏", "稀有武器", "糧草材料"],
    description: "以少勝多的經典戰役，火燒烏巢！",
    bosses: ["袁紹", "顏良", "文醜"],
  },
  {
    id: 6,
    name: "新手試煉",
    difficulty: "簡單",
    difficultyColor: "#22c55e",
    levelRequire: 10,
    playerCount: "單人",
    timeLimit: "15分鐘",
    rewards: ["新手裝備", "經驗藥水", "銀幣"],
    description: "適合新手練習的入門副本。",
    bosses: ["黃巾小頭目"],
  },
];

// 競技場資料
const arenaInfo = {
  rankings: [
    { rank: 1, name: "無敵戰神", guild: "天下第一", score: 2850, winRate: "78%" },
    { rank: 2, name: "劍舞蒼穹", guild: "霸王軍團", score: 2720, winRate: "75%" },
    { rank: 3, name: "風雲再起", guild: "龍騰虎躍", score: 2680, winRate: "72%" },
    { rank: 4, name: "一劍封喉", guild: "劍指天涯", score: 2590, winRate: "70%" },
    { rank: 5, name: "戰無不勝", guild: "天下第一", score: 2540, winRate: "68%" },
    { rank: 6, name: "烈焰狂龍", guild: "火焰軍團", score: 2480, winRate: "67%" },
    { rank: 7, name: "冷月無聲", guild: "月影門", score: 2420, winRate: "65%" },
    { rank: 8, name: "雷霆萬鈞", guild: "雷霆戰隊", score: 2380, winRate: "64%" },
    { rank: 9, name: "劍心通明", guild: "劍心閣", score: 2340, winRate: "63%" },
    { rank: 10, name: "風起雲湧", guild: "風雲會", score: 2300, winRate: "62%" },
  ],
  tiers: [
    { name: "王者", icon: "👑", score: "2500+", color: "#ff6b00", rewards: "傳說武器、專屬稱號" },
    { name: "宗師", icon: "🏆", score: "2000-2499", color: "#a855f7", rewards: "史詩武器、限定時裝" },
    { name: "大師", icon: "⭐", score: "1500-1999", color: "#3b82f6", rewards: "稀有武器、競技寶箱" },
    { name: "精英", icon: "🎖️", score: "1000-1499", color: "#22c55e", rewards: "普通武器、材料獎勵" },
    { name: "新秀", icon: "🌟", score: "0-999", color: "#6b7280", rewards: "基礎獎勵" },
  ],
  rules: [
    { title: "匹配規則", content: "系統根據段位和勝率進行智能匹配，確保公平競技" },
    { title: "積分計算", content: "勝利 +25~35 分，失敗 -15~25 分，連勝有額外加成" },
    { title: "賽季結算", content: "賽季結束時根據最終段位發放獎勵，積分重置" },
    { title: "每日限制", content: "每日可進行 20 場排位賽，額外場次需消耗挑戰券" },
  ],
};

async function main() {
  console.log('開始初始化 Guide 頁面資料...');

  const contentBlocks = [
    { key: 'beginnerGuide', payload: beginnerGuide },
    { key: 'treasureBoxes', payload: treasureBoxes },
    { key: 'downloadCenter', payload: downloadCenter },
    { key: 'gameSettings', payload: gameSettings },
    { key: 'nationWar', payload: nationWar },
    { key: 'sponsorPlans', payload: sponsorPlans },
    { key: 'dungeons', payload: dungeons },
    { key: 'arenaInfo', payload: arenaInfo },
  ];

  for (const block of contentBlocks) {
    await prisma.contentBlock.upsert({
      where: { key: block.key },
      update: { payload: block.payload },
      create: { key: block.key, payload: block.payload },
    });
    console.log(`✅ 已初始化: ${block.key}`);
  }

  console.log('\n🎉 所有 Guide 頁面資料初始化完成！');
}

main()
  .catch((e) => {
    console.error('初始化失敗:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
