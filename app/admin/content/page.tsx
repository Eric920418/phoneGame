"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, AlertCircle, Check, Plus, Trash2,
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

// 默认数据
const defaultData: Record<string, unknown[]> = {
  eventAnnouncements: [
    { id: 1, title: "雙十二狂歡活動", date: "12/12-12/15", type: "限時", isHot: true },
  ],
  sponsorPlans: [
    { name: "青銅", price: 100, color: "#cd7f32", benefits: ["500 元寶", "專屬稱號"], popular: false },
  ],
  downloadItems: [
    { name: "Windows 客戶端", icon: "Monitor", size: "3.2 GB", version: "v2.5.3" },
  ],
  gameSettings: [
    { category: "畫面", settings: [{ name: "解析度", value: "1920x1080" }] },
  ],
  beginnerGuides: [
    { chapter: 1, title: "建立角色", desc: "選擇陣營與職業" },
  ],
  dropItems: [
    { name: "赤兔馬", location: "虎牢關", boss: "呂布", rate: "0.5%", rarity: "傳說", color: "#ff6b00" },
  ],
  dungeons: [
    { name: "虎牢關", level: 60, difficulty: "傳說", color: "#ff6b00", players: "5人", boss: "呂布" },
  ],
  treasureBoxes: [
    { name: "傳說寶箱", color: "#ff6b00", items: ["赤兔馬 1%", "傳說武器 5%"] },
  ],
  bossList: [
    { name: "呂布", title: "無雙戰神", location: "虎牢關", level: 60, type: "副本", color: "#ff6b00" },
  ],
  warSchedule: [
    { day: "週六", time: "19:00-22:00", type: "國戰", highlight: true },
  ],
  arenaRanking: [
    { rank: 1, name: "無敵戰神", guild: "天下第一", score: 2850 },
  ],
  playerReviews: [
    { id: 1, name: "龍戰天下", avatar: "🐉", rating: 5, hours: 1280, date: "2024-12-01", content: "很好玩！", helpful: 156, isRecommended: true },
  ],
};

interface ContentBlock {
  id: number;
  key: string;
  payload: unknown;
}

export default function AdminContentPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [blocks, setBlocks] = useState<Record<string, unknown[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<unknown[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/auth");
    }
  }, [isLoading, user, router]);

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

      const blocksMap: Record<string, unknown[]> = {};
      data.contentBlocks.forEach((block) => {
        blocksMap[block.key] = block.payload as unknown[];
      });
      setBlocks(blocksMap);
    } catch (err) {
      console.error("獲取內容失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContentBlocks();
    }
  }, [user]);

  const handleSectionClick = (key: string) => {
    setActiveSection(key);
    const data = blocks[key] || defaultData[key] || [];
    setEditingData(JSON.parse(JSON.stringify(data)));
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!activeSection) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await graphqlFetch(`
        mutation($key: String!, $input: ContentBlockInput!) {
          upsertContentBlock(key: $key, input: $input) {
            id
          }
        }
      `, {
        key: activeSection,
        input: { payload: editingData },
      });

      setBlocks({ ...blocks, [activeSection]: editingData });
      setSuccess("儲存成功！");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    if (!activeSection) return;
    const template = defaultData[activeSection]?.[0] || {};
    const newItem = JSON.parse(JSON.stringify(template));
    if ('id' in newItem) newItem.id = Date.now();
    if ('rank' in newItem) newItem.rank = editingData.length + 1;
    if ('chapter' in newItem) newItem.chapter = editingData.length + 1;
    setEditingData([...editingData, newItem]);
  };

  const removeItem = (index: number) => {
    setEditingData(editingData.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: unknown) => {
    const newData = [...editingData];
    (newData[index] as Record<string, unknown>)[field] = value;
    setEditingData(newData);
  };

  const updateNestedItem = (index: number, field: string, subIndex: number, subField: string, value: unknown) => {
    const newData = [...editingData];
    const item = newData[index] as Record<string, unknown>;
    const arr = item[field] as Record<string, unknown>[];
    arr[subIndex][subField] = value;
    setEditingData(newData);
  };

  const addNestedItem = (index: number, field: string, template: Record<string, unknown>) => {
    const newData = [...editingData];
    const item = newData[index] as Record<string, unknown>;
    const arr = (item[field] as unknown[]) || [];
    arr.push({ ...template });
    item[field] = arr;
    setEditingData(newData);
  };

  const removeNestedItem = (index: number, field: string, subIndex: number) => {
    const newData = [...editingData];
    const item = newData[index] as Record<string, unknown>;
    const arr = item[field] as unknown[];
    arr.splice(subIndex, 1);
    setEditingData(newData);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center">
        <div className="animate-pulse text-[var(--color-text-muted)]">載入中...</div>
      </div>
    );
  }

  const currentSection = contentSections.find(s => s.key === activeSection);

  // 渲染表单字段
  const renderForm = () => {
    if (!activeSection || !editingData) return null;

    switch (activeSection) {
      case "eventAnnouncements":
        return editingData.map((item: unknown, index: number) => {
          const data = item as { title: string; date: string; type: string; isHot: boolean };
          return (
            <div key={index} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-primary)] font-medium">活動 #{index + 1}</span>
                <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={data.title}
                onChange={(e) => updateItem(index, "title", e.target.value)}
                placeholder="活動標題"
                className="input w-full"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={data.date}
                  onChange={(e) => updateItem(index, "date", e.target.value)}
                  placeholder="日期 (如: 12/12-12/15)"
                  className="input"
                />
                <input
                  type="text"
                  value={data.type}
                  onChange={(e) => updateItem(index, "type", e.target.value)}
                  placeholder="類型 (如: 限時)"
                  className="input"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.isHot}
                  onChange={(e) => updateItem(index, "isHot", e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-[var(--color-text)] text-sm">熱門活動 🔥</span>
              </label>
            </div>
          );
        });

      case "sponsorPlans":
        return editingData.map((item: unknown, index: number) => {
          const data = item as { name: string; price: number; color: string; benefits: string[]; popular?: boolean };
          return (
            <div key={index} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-primary)] font-medium">方案 #{index + 1}</span>
                <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  placeholder="方案名稱"
                  className="input"
                />
                <input
                  type="number"
                  value={data.price}
                  onChange={(e) => updateItem(index, "price", parseInt(e.target.value) || 0)}
                  placeholder="價格"
                  className="input"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-text-muted)] text-sm">顏色</span>
                  <input
                    type="color"
                    value={data.color}
                    onChange={(e) => updateItem(index, "color", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="text-[var(--color-text)] text-sm mb-2 block">福利內容 (每行一個)</label>
                <textarea
                  value={(data.benefits || []).join("\n")}
                  onChange={(e) => updateItem(index, "benefits", e.target.value.split("\n").filter(Boolean))}
                  placeholder="500 元寶&#10;專屬稱號&#10;稀有坐騎"
                  className="input w-full min-h-[100px]"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.popular || false}
                  onChange={(e) => updateItem(index, "popular", e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-[var(--color-text)] text-sm">推薦方案 ⭐</span>
              </label>
            </div>
          );
        });

      case "downloadItems":
        return editingData.map((item: unknown, index: number) => {
          const data = item as { name: string; icon: string; size: string; version: string };
          return (
            <div key={index} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-primary)] font-medium">下載項目 #{index + 1}</span>
                <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={data.name}
                onChange={(e) => updateItem(index, "name", e.target.value)}
                placeholder="名稱 (如: Windows 客戶端)"
                className="input w-full"
              />
              <div className="grid grid-cols-3 gap-3">
                <select
                  value={data.icon}
                  onChange={(e) => updateItem(index, "icon", e.target.value)}
                  className="input"
                >
                  <option value="Monitor">💻 電腦版</option>
                  <option value="Smartphone">📱 手機版</option>
                </select>
                <input
                  type="text"
                  value={data.size}
                  onChange={(e) => updateItem(index, "size", e.target.value)}
                  placeholder="檔案大小 (如: 3.2 GB)"
                  className="input"
                />
                <input
                  type="text"
                  value={data.version}
                  onChange={(e) => updateItem(index, "version", e.target.value)}
                  placeholder="版本 (如: v2.5.3)"
                  className="input"
                />
              </div>
            </div>
          );
        });

      case "beginnerGuides":
        return editingData.map((item: unknown, index: number) => {
          const data = item as { chapter: number; title: string; desc: string };
          return (
            <div key={index} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-primary)] font-medium">攻略 #{index + 1}</span>
                <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <input
                  type="number"
                  value={data.chapter}
                  onChange={(e) => updateItem(index, "chapter", parseInt(e.target.value) || 1)}
                  placeholder="章節"
                  className="input"
                  min={1}
                />
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => updateItem(index, "title", e.target.value)}
                  placeholder="標題 (如: 建立角色)"
                  className="input col-span-3"
                />
              </div>
              <input
                type="text"
                value={data.desc}
                onChange={(e) => updateItem(index, "desc", e.target.value)}
                placeholder="描述 (如: 選擇陣營與職業)"
                className="input w-full"
              />
            </div>
          );
        });

      case "dropItems":
        return editingData.map((item: unknown, index: number) => {
          const data = item as { name: string; location: string; boss: string; rate: string; rarity: string; color: string };
          return (
            <div key={index} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-primary)] font-medium">掉落物 #{index + 1}</span>
                <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  placeholder="物品名稱"
                  className="input"
                />
                <input
                  type="text"
                  value={data.location}
                  onChange={(e) => updateItem(index, "location", e.target.value)}
                  placeholder="掉落地點"
                  className="input"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={data.boss}
                  onChange={(e) => updateItem(index, "boss", e.target.value)}
                  placeholder="來源 BOSS"
                  className="input"
                />
                <input
                  type="text"
                  value={data.rate}
                  onChange={(e) => updateItem(index, "rate", e.target.value)}
                  placeholder="掉落機率 (如: 0.5%)"
                  className="input"
                />
                <select
                  value={data.rarity}
                  onChange={(e) => {
                    const rarity = e.target.value;
                    const colors: Record<string, string> = { "傳說": "#ff6b00", "史詩": "#a855f7", "稀有": "#3b82f6", "普通": "#6b7280" };
                    updateItem(index, "rarity", rarity);
                    updateItem(index, "color", colors[rarity] || "#6b7280");
                  }}
                  className="input"
                >
                  <option value="傳說">🟠 傳說</option>
                  <option value="史詩">🟣 史詩</option>
                  <option value="稀有">🔵 稀有</option>
                  <option value="普通">⚪ 普通</option>
                </select>
              </div>
            </div>
          );
        });

      case "dungeons":
        return editingData.map((item: unknown, index: number) => {
          const data = item as { name: string; level: number; difficulty: string; color: string; players: string; boss: string };
          return (
            <div key={index} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-primary)] font-medium">副本 #{index + 1}</span>
                <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  placeholder="副本名稱"
                  className="input"
                />
                <input
                  type="number"
                  value={data.level}
                  onChange={(e) => updateItem(index, "level", parseInt(e.target.value) || 1)}
                  placeholder="等級要求"
                  className="input"
                  min={1}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <select
                  value={data.difficulty}
                  onChange={(e) => {
                    const diff = e.target.value;
                    const colors: Record<string, string> = { "傳說": "#ff6b00", "史詩": "#a855f7", "困難": "#3b82f6", "普通": "#22c55e" };
                    updateItem(index, "difficulty", diff);
                    updateItem(index, "color", colors[diff] || "#6b7280");
                  }}
                  className="input"
                >
                  <option value="傳說">🟠 傳說</option>
                  <option value="史詩">🟣 史詩</option>
                  <option value="困難">🔵 困難</option>
                  <option value="普通">🟢 普通</option>
                </select>
                <input
                  type="text"
                  value={data.players}
                  onChange={(e) => updateItem(index, "players", e.target.value)}
                  placeholder="人數 (如: 5人)"
                  className="input"
                />
                <input
                  type="text"
                  value={data.boss}
                  onChange={(e) => updateItem(index, "boss", e.target.value)}
                  placeholder="最終 BOSS"
                  className="input"
                />
              </div>
            </div>
          );
        });

      case "treasureBoxes":
        return editingData.map((item: unknown, index: number) => {
          const data = item as { name: string; color: string; items: string[] };
          return (
            <div key={index} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-primary)] font-medium">寶箱 #{index + 1}</span>
                <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  placeholder="寶箱名稱"
                  className="input flex-1"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-text-muted)] text-sm">顏色</span>
                  <input
                    type="color"
                    value={data.color}
                    onChange={(e) => updateItem(index, "color", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="text-[var(--color-text)] text-sm mb-2 block">寶箱內容 (每行一個，格式: 物品名 機率)</label>
                <textarea
                  value={(data.items || []).join("\n")}
                  onChange={(e) => updateItem(index, "items", e.target.value.split("\n").filter(Boolean))}
                  placeholder="赤兔馬 1%&#10;傳說武器 5%&#10;元寶 x1000 20%"
                  className="input w-full min-h-[100px]"
                />
              </div>
            </div>
          );
        });

      case "bossList":
        return editingData.map((item: unknown, index: number) => {
          const data = item as { name: string; title: string; location: string; level: number; type: string; color: string };
          return (
            <div key={index} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-primary)] font-medium">BOSS #{index + 1}</span>
                <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  placeholder="BOSS 名稱"
                  className="input"
                />
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => updateItem(index, "title", e.target.value)}
                  placeholder="稱號 (如: 無雙戰神)"
                  className="input"
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                <input
                  type="text"
                  value={data.location}
                  onChange={(e) => updateItem(index, "location", e.target.value)}
                  placeholder="出沒地點"
                  className="input"
                />
                <input
                  type="number"
                  value={data.level}
                  onChange={(e) => updateItem(index, "level", parseInt(e.target.value) || 1)}
                  placeholder="等級"
                  className="input"
                  min={1}
                />
                <select
                  value={data.type}
                  onChange={(e) => updateItem(index, "type", e.target.value)}
                  className="input"
                >
                  <option value="副本">副本 BOSS</option>
                  <option value="世界">世界 BOSS</option>
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.color}
                    onChange={(e) => updateItem(index, "color", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          );
        });

      case "warSchedule":
        return editingData.map((item: unknown, index: number) => {
          const data = item as { day: string; time: string; type: string; highlight: boolean };
          return (
            <div key={index} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-primary)] font-medium">時段 #{index + 1}</span>
                <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={data.day}
                  onChange={(e) => updateItem(index, "day", e.target.value)}
                  placeholder="日期 (如: 週六)"
                  className="input"
                />
                <input
                  type="text"
                  value={data.time}
                  onChange={(e) => updateItem(index, "time", e.target.value)}
                  placeholder="時間 (如: 19:00-22:00)"
                  className="input"
                />
                <input
                  type="text"
                  value={data.type}
                  onChange={(e) => updateItem(index, "type", e.target.value)}
                  placeholder="活動類型 (如: 國戰)"
                  className="input"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.highlight}
                  onChange={(e) => updateItem(index, "highlight", e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-[var(--color-text)] text-sm">重點活動 (特別標示)</span>
              </label>
            </div>
          );
        });

      case "arenaRanking":
        return editingData.map((item: unknown, index: number) => {
          const data = item as { rank: number; name: string; guild: string; score: number };
          return (
            <div key={index} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-primary)] font-medium">排名 #{index + 1}</span>
                <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <input
                  type="number"
                  value={data.rank}
                  onChange={(e) => updateItem(index, "rank", parseInt(e.target.value) || 1)}
                  placeholder="名次"
                  className="input"
                  min={1}
                />
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  placeholder="玩家名稱"
                  className="input"
                />
                <input
                  type="text"
                  value={data.guild}
                  onChange={(e) => updateItem(index, "guild", e.target.value)}
                  placeholder="所屬公會"
                  className="input"
                />
                <input
                  type="number"
                  value={data.score}
                  onChange={(e) => updateItem(index, "score", parseInt(e.target.value) || 0)}
                  placeholder="積分"
                  className="input"
                />
              </div>
            </div>
          );
        });

      case "playerReviews":
        return editingData.map((item: unknown, index: number) => {
          const data = item as { name: string; avatar: string; rating: number; hours: number; date: string; content: string; helpful: number; isRecommended: boolean };
          return (
            <div key={index} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-primary)] font-medium">評價 #{index + 1}</span>
                <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  placeholder="玩家名稱"
                  className="input"
                />
                <input
                  type="text"
                  value={data.avatar}
                  onChange={(e) => updateItem(index, "avatar", e.target.value)}
                  placeholder="頭像 Emoji (如: 🐉)"
                  className="input"
                />
                <input
                  type="text"
                  value={data.date}
                  onChange={(e) => updateItem(index, "date", e.target.value)}
                  placeholder="日期 (如: 2024-12-01)"
                  className="input"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[var(--color-text-muted)] text-xs mb-1 block">評分 ⭐ (1-5)</label>
                  <select
                    value={data.rating}
                    onChange={(e) => updateItem(index, "rating", parseInt(e.target.value))}
                    className="input w-full"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5分)</option>
                    <option value={4}>⭐⭐⭐⭐ (4分)</option>
                    <option value={3}>⭐⭐⭐ (3分)</option>
                    <option value={2}>⭐⭐ (2分)</option>
                    <option value={1}>⭐ (1分)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[var(--color-text-muted)] text-xs mb-1 block">遊戲時數</label>
                  <input
                    type="number"
                    value={data.hours}
                    onChange={(e) => updateItem(index, "hours", parseInt(e.target.value) || 0)}
                    className="input w-full"
                    min={0}
                  />
                </div>
                <div>
                  <label className="text-[var(--color-text-muted)] text-xs mb-1 block">有幫助人數</label>
                  <input
                    type="number"
                    value={data.helpful}
                    onChange={(e) => updateItem(index, "helpful", parseInt(e.target.value) || 0)}
                    className="input w-full"
                    min={0}
                  />
                </div>
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] text-xs mb-1 block">評價內容</label>
                <textarea
                  value={data.content}
                  onChange={(e) => updateItem(index, "content", e.target.value)}
                  placeholder="玩家的評價內容..."
                  className="input w-full min-h-[80px]"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.isRecommended}
                  onChange={(e) => updateItem(index, "isRecommended", e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-[var(--color-text)] text-sm">推薦此遊戲 👍</span>
              </label>
            </div>
          );
        });

      case "gameSettings":
        return editingData.map((item: unknown, index: number) => {
          const data = item as { category: string; settings: { name: string; value: string }[] };
          return (
            <div key={index} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-primary)] font-medium">設定組 #{index + 1}</span>
                <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={data.category}
                onChange={(e) => updateItem(index, "category", e.target.value)}
                placeholder="分類名稱 (如: 畫面、音效、操作)"
                className="input w-full"
              />
              <div className="space-y-2">
                <label className="text-[var(--color-text)] text-sm">設定項目</label>
                {(data.settings || []).map((setting, sIndex) => (
                  <div key={sIndex} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={setting.name}
                      onChange={(e) => updateNestedItem(index, "settings", sIndex, "name", e.target.value)}
                      placeholder="設定名稱"
                      className="input flex-1"
                    />
                    <input
                      type="text"
                      value={setting.value}
                      onChange={(e) => updateNestedItem(index, "settings", sIndex, "value", e.target.value)}
                      placeholder="建議值"
                      className="input flex-1"
                    />
                    <button
                      onClick={() => removeNestedItem(index, "settings", sIndex)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addNestedItem(index, "settings", { name: "", value: "" })}
                  className="text-[var(--color-primary)] text-sm hover:underline flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  新增設定項目
                </button>
              </div>
            </div>
          );
        });

      default:
        return <p className="text-[var(--color-text-muted)]">此區塊暫不支援視覺化編輯</p>;
    }
  };

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
            <p className="text-[var(--color-text-muted)] text-sm">輕鬆編輯首頁各區塊的內容</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：區塊列表 */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">選擇要編輯的區塊</h2>
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
                        {hasData ? "✅ 已自訂" : "📝 使用預設"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 右側：編輯區 */}
          <div className="lg:col-span-2">
            {activeSection ? (
              <div>
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-[var(--color-bg-dark)] py-2 z-10">
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
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "儲存中..." : "儲存變更"}
                  </button>
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

                <div className="space-y-4">
                  {renderForm()}
                </div>

                <button
                  onClick={addItem}
                  className="mt-4 w-full card p-4 flex items-center justify-center gap-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors border-dashed"
                >
                  <Plus className="w-5 h-5" />
                  新增項目
                </button>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">選擇要編輯的區塊</h3>
                <p className="text-[var(--color-text-muted)]">
                  👈 點擊左側的內容區塊開始編輯
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
