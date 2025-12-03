"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, AlertCircle, Check,
  Megaphone, Heart, Download, Settings, BookOpen, Search,
  Map, Gift, Skull, Swords, Trophy, Quote
} from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

// 首页内容区块配置
const contentSections = [
  { key: "eventAnnouncements", title: "活動公告", icon: Megaphone, color: "#e74c3c" },
  { key: "sponsorPlans", title: "贊助方案", icon: Heart, color: "#e91e63" },
  { key: "downloadItems", title: "下載專區", icon: Download, color: "#3498db" },
  { key: "gameSettings", title: "遊戲設定", icon: Settings, color: "#9b59b6" },
  { key: "beginnerGuides", title: "新手攻略", icon: BookOpen, color: "#2ecc71" },
  { key: "dropItems", title: "掉落查詢", icon: Search, color: "#f39c12" },
  { key: "dungeons", title: "副本介紹", icon: Map, color: "#1abc9c" },
  { key: "treasureBoxes", title: "寶箱內容", icon: Gift, color: "#f1c40f" },
  { key: "bossList", title: "BOSS介紹", icon: Skull, color: "#c0392b" },
  { key: "warSchedule", title: "國戰時間", icon: Swords, color: "#8e44ad" },
  { key: "arenaRanking", title: "武魂擂台", icon: Trophy, color: "#c9a227" },
  { key: "playerReviews", title: "玩家評價", icon: Quote, color: "#10b981" },
];

// 默认数据模板
const defaultData: Record<string, unknown> = {
  eventAnnouncements: [
    { id: 1, title: "雙十二狂歡活動", date: "12/12-12/15", type: "限時", isHot: true },
    { id: 2, title: "新武將「諸葛亮」限時登場", date: "12/10-12/20", type: "新內容", isHot: true },
    { id: 3, title: "每週挑戰賽事", date: "12/08-12/14", type: "競技", isHot: false },
    { id: 4, title: "公會招募活動", date: "12/01-12/31", type: "社群", isHot: false },
  ],
  sponsorPlans: [
    { name: "青銅", price: 100, color: "#cd7f32", benefits: ["500 元寶", "專屬稱號"] },
    { name: "白銀", price: 300, color: "#c0c0c0", benefits: ["2000 元寶", "稀有坐騎"] },
    { name: "黃金", price: 500, color: "#ffd700", benefits: ["5000 元寶", "傳說坐騎", "專屬時裝"], popular: true },
    { name: "鑽石", price: 1000, color: "#b9f2ff", benefits: ["15000 元寶", "神話坐騎", "永久加成"] },
  ],
  downloadItems: [
    { name: "Windows 客戶端", icon: "Monitor", size: "3.2 GB", version: "v2.5.3" },
    { name: "Android 版本", icon: "Smartphone", size: "1.8 GB", version: "v2.5.3" },
  ],
  gameSettings: [
    { category: "畫面", settings: [{ name: "解析度", value: "1920x1080" }, { name: "畫質", value: "高" }] },
    { category: "音效", settings: [{ name: "主音量", value: "70%" }, { name: "背景音樂", value: "50%" }] },
    { category: "操作", settings: [{ name: "智慧施法", value: "開啟" }, { name: "自動攻擊", value: "開啟" }] },
  ],
  beginnerGuides: [
    { chapter: 1, title: "建立角色", desc: "選擇陣營與職業" },
    { chapter: 2, title: "戰鬥入門", desc: "基礎操作與技能" },
    { chapter: 3, title: "探索世界", desc: "主線與支線任務" },
    { chapter: 4, title: "加入公會", desc: "團隊合作與福利" },
  ],
  dropItems: [
    { name: "赤兔馬", location: "虎牢關", boss: "呂布", rate: "0.5%", rarity: "傳說", color: "#ff6b00" },
    { name: "青龍偃月刀", location: "樊城", boss: "關羽影", rate: "2%", rarity: "史詩", color: "#a855f7" },
    { name: "諸葛錦囊", location: "臥龍崗", boss: "任意怪物", rate: "5%", rarity: "稀有", color: "#3b82f6" },
    { name: "五虎將令牌", location: "五虎將副本", boss: "各五虎將", rate: "1%", rarity: "傳說", color: "#ff6b00" },
  ],
  dungeons: [
    { name: "虎牢關", level: 60, difficulty: "傳說", color: "#ff6b00", players: "5人", boss: "呂布" },
    { name: "赤壁之戰", level: 50, difficulty: "史詩", color: "#a855f7", players: "10人", boss: "曹操軍團" },
    { name: "五丈原", level: 55, difficulty: "史詩", color: "#a855f7", players: "5人", boss: "司馬懿幻影" },
    { name: "長坂坡", level: 40, difficulty: "困難", color: "#3b82f6", players: "3人", boss: "曹軍先鋒" },
  ],
  treasureBoxes: [
    { name: "傳說寶箱", color: "#ff6b00", items: ["赤兔馬 1%", "傳說武器 5%", "元寶 x1000 20%"] },
    { name: "史詩寶箱", color: "#a855f7", items: ["史詩武器 3%", "稀有材料 15%", "元寶 x500 20%"] },
    { name: "國戰寶箱", color: "#ef4444", items: ["虎符 5%", "專屬時裝 3%", "榮譽點數 30%"] },
  ],
  bossList: [
    { name: "呂布", title: "無雙戰神", location: "虎牢關", level: 60, type: "副本", color: "#ff6b00" },
    { name: "曹操", title: "亂世梟雄", location: "許昌皇城", level: 55, type: "世界", color: "#a855f7" },
    { name: "關羽", title: "武聖", location: "樊城", level: 50, type: "副本", color: "#ef4444" },
    { name: "諸葛亮", title: "臥龍先生", location: "五丈原", level: 55, type: "副本", color: "#3b82f6" },
  ],
  warSchedule: [
    { day: "週六", time: "19:00-22:00", type: "國戰", highlight: true },
    { day: "週日", time: "19:00-22:00", type: "國戰", highlight: true },
    { day: "週五", time: "20:00-22:00", type: "公會戰", highlight: false },
    { day: "週二/四", time: "20:00-21:30", type: "資源戰", highlight: false },
  ],
  arenaRanking: [
    { rank: 1, name: "無敵戰神", guild: "天下第一", score: 2850 },
    { rank: 2, name: "劍舞蒼穹", guild: "霸王軍團", score: 2720 },
    { rank: 3, name: "風雲再起", guild: "龍騰虎躍", score: 2680 },
    { rank: 4, name: "一劍封喉", guild: "劍指天涯", score: 2590 },
    { rank: 5, name: "戰無不勝", guild: "天下第一", score: 2540 },
  ],
  playerReviews: [
    {
      id: 1,
      name: "龍戰天下",
      avatar: "🐉",
      rating: 5,
      hours: 1280,
      date: "2024-12-01",
      content: "玩了快兩年了，這款三國遊戲真的很用心！國戰系統超刺激，每週末都跟公會兄弟一起衝，感覺熱血沸騰。畫面精緻，操作流暢，推薦給喜歡三國的玩家！",
      helpful: 156,
      isRecommended: true,
    },
    {
      id: 2,
      name: "蜀漢丞相",
      avatar: "🎭",
      rating: 5,
      hours: 860,
      date: "2024-11-28",
      content: "副本設計很有創意，每個 BOSS 都有獨特的機制，需要團隊配合。武將系統豐富，收集控的天堂。客服回覆也很快，遇到問題都能及時解決。",
      helpful: 89,
      isRecommended: true,
    },
  ],
};

interface ContentBlock {
  id: number;
  key: string;
  payload: unknown;
}

export default function AdminContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [blocks, setBlocks] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [editingJson, setEditingJson] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const fetchContentBlocks = async () => {
    try {
      const data = await graphqlFetch<{ contentBlocks: ContentBlock[] }>(`
        query {
          contentBlocks {
            id
            key
            payload
          }
        }
      `);

      const blocksMap: Record<string, unknown> = {};
      data.contentBlocks.forEach((block) => {
        blocksMap[block.key] = block.payload;
      });
      setBlocks(blocksMap);
    } catch (err) {
      console.error("獲取內容失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchContentBlocks();
    }
  }, [session]);

  const handleSectionClick = (key: string) => {
    setActiveSection(key);
    const data = blocks[key] || defaultData[key];
    setEditingJson(JSON.stringify(data, null, 2));
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!activeSection) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // 验证 JSON
      const parsedData = JSON.parse(editingJson);

      await graphqlFetch(`
        mutation($key: String!, $input: ContentBlockInput!) {
          upsertContentBlock(key: $key, input: $input) {
            id
          }
        }
      `, {
        key: activeSection,
        input: { payload: parsedData },
      });

      setBlocks({ ...blocks, [activeSection]: parsedData });
      setSuccess("儲存成功！");

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("JSON 格式錯誤，請檢查格式");
      } else {
        setError(err instanceof Error ? err.message : "儲存失敗");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!activeSection) return;
    const data = defaultData[activeSection];
    setEditingJson(JSON.stringify(data, null, 2));
    setError(null);
    setSuccess(null);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center">
        <div className="animate-pulse text-[var(--color-text-muted)]">載入中...</div>
      </div>
    );
  }

  const currentSection = contentSections.find(s => s.key === activeSection);

  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/dashboard"
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-card)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">首頁內容管理</h1>
            <p className="text-[var(--color-text-muted)] text-sm">管理首頁各區塊的動態內容</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：區塊列表 */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">內容區塊</h2>
            <div className="space-y-2">
              {contentSections.map((section) => {
                const IconComp = section.icon;
                const hasData = blocks[section.key] !== undefined;

                return (
                  <button
                    key={section.key}
                    onClick={() => handleSectionClick(section.key)}
                    className={`w-full card p-4 flex items-center gap-3 transition-all ${
                      activeSection === section.key
                        ? "ring-2 ring-[var(--color-primary)]"
                        : "hover:border-[var(--color-primary)]/30"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${section.color}20` }}
                    >
                      <IconComp className="w-5 h-5" style={{ color: section.color }} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h3 className="font-medium text-[var(--color-text)] truncate">{section.title}</h3>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {hasData ? "已自訂" : "使用預設"}
                      </p>
                    </div>
                    {hasData && (
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 右側：編輯區 */}
          <div className="lg:col-span-2">
            {activeSection ? (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {currentSection && (
                      <>
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${currentSection.color}20` }}
                        >
                          <currentSection.icon className="w-5 h-5" style={{ color: currentSection.color }} />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--color-text)]">{currentSection.title}</h2>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReset}
                      className="btn btn-secondary text-sm"
                    >
                      重置為預設
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn btn-primary text-sm"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "儲存中..." : "儲存"}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 shrink-0" />
                    <p className="text-green-400 text-sm">{success}</p>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-[var(--color-text-muted)] text-sm mb-2">
                    編輯 JSON 格式的內容數據。修改後點擊「儲存」按鈕保存。
                  </p>
                </div>

                <textarea
                  value={editingJson}
                  onChange={(e) => setEditingJson(e.target.value)}
                  className="input w-full font-mono text-sm min-h-[500px] resize-y"
                  spellCheck={false}
                />
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">選擇要編輯的區塊</h3>
                <p className="text-[var(--color-text-muted)]">
                  點擊左側的內容區塊開始編輯首頁內容
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
