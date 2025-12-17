"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, AlertCircle, Check, Plus, Trash2,
  Heart, Download, Settings, BookOpen, Search,
  Map, Gift, Skull, Swords, Trophy, Quote, Flag, ChevronUp, ChevronDown,
  Upload, FileSpreadsheet, X
} from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

// 首页内容区块配置
const contentSections = [
  { key: "sponsorPlans", title: "贊助方案", icon: Heart, color: "#e91e63" },
  { key: "downloadCenter", title: "下載專區", icon: Download, color: "#3498db" },
  { key: "gameSettings", title: "遊戲設定", icon: Settings, color: "#9b59b6" },
  { key: "beginnerGuides", title: "新手攻略", icon: BookOpen, color: "#2ecc71" },
  { key: "dropItems", title: "掉落查詢", icon: Search, color: "#f39c12" },
  { key: "dungeons", title: "副本介紹", icon: Map, color: "#1abc9c" },
  { key: "treasureBoxes", title: "寶箱福袋內容", icon: Gift, color: "#f1c40f" },
  { key: "nationWar", title: "國戰時間", icon: Swords, color: "#8e44ad" },
  { key: "arenaRanking", title: "三國排行", icon: Trophy, color: "#c9a227" },
  { key: "playerReviews", title: "玩家評價", icon: Quote, color: "#10b981" },
];

// 默认数据
const defaultData: Record<string, unknown[]> = {
  sponsorPlans: [
    { name: "青銅", price: 100, color: "#cd7f32", benefits: ["500 元寶", "專屬稱號"], popular: false, link: "" },
  ],
  downloadCenter: {
    downloads: [
      { id: "windows", name: "Windows 客戶端", icon: "Monitor", version: "v1.0.0", size: "3.2 GB", description: "適用於 Windows 10/11 64位元系統", downloadUrl: "", color: "#0078d4" },
      { id: "mac", name: "macOS 客戶端", icon: "Apple", version: "v1.0.0", size: "3.5 GB", description: "適用於 macOS 12.0 或更高版本", downloadUrl: "", color: "#555555" },
    ],
    patches: [],
  } as unknown as unknown[],
  gameSettings: [
    { category: "畫面", settings: [{ name: "解析度", value: "1920x1080" }] },
  ],
  beginnerGuides: [
    { chapter: 1, title: "建立角色", desc: "選擇陣營與職業" },
  ],
  dropItems: [],
  dungeons: [],
  treasureBoxes: [
    { name: "寶箱名稱", items: ["物品1", "物品2"] },
  ],
  bossList: [
    { name: "呂布", title: "無雙戰神", location: "虎牢關", level: 60, type: "副本", color: "#ff6b00" },
  ],
  nationWar: {
    warSchedule: [
      { day: "週六", time: "19:00-22:00", type: "國戰", highlight: true },
    ],
    rules: [
      { title: "參戰資格", items: ["角色等級達到 30 級以上"] },
    ],
    rewards: [
      { rank: "冠軍陣營", items: ["國戰寶箱 x3", "榮譽點數 x1000"] },
    ],
    factions: [
      { name: "", color: "#3b82f6", leader: "", description: "", bonus: "" },
    ],
    factionsImage: "",
  },
  arenaRanking: {
    levelRanking: [],
    nationWarRanking: [],
    chibiRanking: [],
  },
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

  // Excel 導入相關 state
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [excelFiles, setExcelFiles] = useState<File[]>([]);
  const [excelParsing, setExcelParsing] = useState(false);
  const [excelPreviewData, setExcelPreviewData] = useState<unknown[] | null>(null);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [excelParseErrors, setExcelParseErrors] = useState<string[]>([]);

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
    // arenaRanking 使用對象格式而非數組
    if (key === "arenaRanking") {
      const data = blocks[key] || defaultData[key] || { levelRanking: [], nationWarRanking: [], chibiRanking: [] };
      setEditingData(JSON.parse(JSON.stringify(data)) as unknown as unknown[]);
    } else if (key === "downloadCenter") {
      // downloadCenter 使用對象格式：{ downloads: [], patches: [] }
      // 只保留 Windows 和 Mac
      const rawData = blocks[key] || defaultData[key] || { downloads: [], patches: [] };
      const data = JSON.parse(JSON.stringify(rawData)) as { downloads: { id: string }[]; patches: unknown[] };
      data.downloads = data.downloads.filter((d) => d.id === "windows" || d.id === "mac");
      setEditingData(data as unknown as unknown[]);
    } else if (key === "nationWar") {
      // nationWar 整合多個區塊：warSchedule, nationWar(rules/rewards), factions, factionsImage
      const warSchedule = blocks["warSchedule"] || [];
      const nationWarData = blocks["nationWar"] as { rules?: unknown[]; rewards?: unknown[] } || {};
      const factions = blocks["factions"] || [];
      const factionsImageData = blocks["factionsImage"] as { image?: string }[] || [];
      const factionsImage = factionsImageData[0]?.image || "";

      const combinedData = {
        warSchedule: Array.isArray(warSchedule) ? warSchedule : [],
        rules: nationWarData.rules || (defaultData.nationWar as { rules: unknown[] }).rules || [],
        rewards: nationWarData.rewards || (defaultData.nationWar as { rewards: unknown[] }).rewards || [],
        factions: Array.isArray(factions) ? factions : [],
        factionsImage: factionsImage,
      };
      setEditingData(JSON.parse(JSON.stringify(combinedData)) as unknown as unknown[]);
    } else {
      const data = blocks[key] || defaultData[key] || [];
      setEditingData(JSON.parse(JSON.stringify(data)));
    }
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!activeSection) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (activeSection === "nationWar") {
        // nationWar 需要分別儲存到多個 key
        const data = editingData as unknown as {
          warSchedule: unknown[];
          rules: unknown[];
          rewards: unknown[];
          factions: unknown[];
          factionsImage: string;
        };

        await Promise.all([
          graphqlFetch(`
            mutation($key: String!, $input: ContentBlockInput!) {
              upsertContentBlock(key: $key, input: $input) { id }
            }
          `, { key: "warSchedule", input: { payload: data.warSchedule } }),
          graphqlFetch(`
            mutation($key: String!, $input: ContentBlockInput!) {
              upsertContentBlock(key: $key, input: $input) { id }
            }
          `, { key: "nationWar", input: { payload: { rules: data.rules, rewards: data.rewards } } }),
          graphqlFetch(`
            mutation($key: String!, $input: ContentBlockInput!) {
              upsertContentBlock(key: $key, input: $input) { id }
            }
          `, { key: "factions", input: { payload: data.factions } }),
          graphqlFetch(`
            mutation($key: String!, $input: ContentBlockInput!) {
              upsertContentBlock(key: $key, input: $input) { id }
            }
          `, { key: "factionsImage", input: { payload: [{ image: data.factionsImage }] } }),
        ]);

        setBlocks({
          ...blocks,
          warSchedule: data.warSchedule,
          nationWar: { rules: data.rules, rewards: data.rewards },
          factions: data.factions,
          factionsImage: [{ image: data.factionsImage }],
        });
      } else {
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
      }
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

    // 為沒有預設資料的區塊提供模板
    const emptyTemplates: Record<string, unknown> = {
      dropItems: { boss: "", location: "", category: "", drops: [] },
      dungeons: { name: "", image: "", cooldown: "", dungeonTime: "", players: "", monsters: [] },
    };

    const template = defaultData[activeSection]?.[0] || emptyTemplates[activeSection] || {};
    const newItem = JSON.parse(JSON.stringify(template));
    if ('id' in newItem) newItem.id = Date.now();
    if ('rank' in newItem) newItem.rank = editingData.length + 1;
    if ('chapter' in newItem) newItem.chapter = editingData.length + 1;

    // dropItems 新增項目插入到最前面，其他區塊添加到最後
    if (activeSection === "dropItems") {
      setEditingData([newItem, ...editingData]);
    } else {
      setEditingData([...editingData, newItem]);
    }
  };

  const removeItem = (index: number) => {
    setEditingData(editingData.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === editingData.length - 1) return;
    const newData = [...editingData];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newData[index], newData[swapIndex]] = [newData[swapIndex], newData[index]];
    setEditingData(newData);
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

  // Excel 導入功能
  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // 合併新選擇的檔案到現有檔案列表
      const newFiles = Array.from(files);
      setExcelFiles(prev => [...prev, ...newFiles]);
      setExcelPreviewData(null);
      setExcelError(null);
      setExcelParseErrors([]);
    }
    e.target.value = ""; // 清空 input 以便重複選擇
  };

  const removeExcelFile = (index: number) => {
    setExcelFiles(prev => prev.filter((_, i) => i !== index));
    setExcelPreviewData(null);
    setExcelError(null);
    setExcelParseErrors([]);
  };

  const handleParseExcel = async () => {
    if (excelFiles.length === 0) return;

    setExcelParsing(true);
    setExcelError(null);
    setExcelParseErrors([]);

    try {
      const allData: unknown[] = [];
      const allErrors: string[] = [];

      // 逐一解析每個檔案
      for (let i = 0; i < excelFiles.length; i++) {
        const file = excelFiles[i];
        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch("/api/parse-excel", {
            method: "POST",
            body: formData,
          });

          const result = await res.json();

          if (res.ok && result.data) {
            // 合併資料
            allData.push(...result.data);
            // 如果有解析錯誤，加上檔名前綴
            if (result.parseErrors && result.parseErrors.length > 0) {
              allErrors.push(...result.parseErrors.map((err: string) => `[${file.name}] ${err}`));
            }
          } else {
            allErrors.push(`[${file.name}] ${result.error || "解析失敗"}`);
          }
        } catch (err) {
          allErrors.push(`[${file.name}] ${err instanceof Error ? err.message : "解析失敗"}`);
        }
      }

      if (allData.length === 0) {
        setExcelError("所有檔案都無法解析，請檢查檔案格式");
        setExcelParseErrors(allErrors);
        return;
      }

      setExcelPreviewData(allData);
      if (allErrors.length > 0) {
        setExcelParseErrors(allErrors);
      }
    } catch (err) {
      setExcelError(err instanceof Error ? err.message : "解析失敗");
    } finally {
      setExcelParsing(false);
    }
  };

  const handleApplyExcelData = () => {
    if (!excelPreviewData) return;

    // 將預覽資料套用到編輯區
    setEditingData(excelPreviewData);
    setShowExcelImport(false);
    setExcelFiles([]);
    setExcelPreviewData(null);
    setSuccess(`Excel 資料已導入（共 ${excelPreviewData.length} 筆），請確認後點擊「儲存變更」按鈕`);
  };

  const resetExcelImport = () => {
    setExcelFiles([]);
    setExcelPreviewData(null);
    setExcelError(null);
    setExcelParseErrors([]);
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
      case "sponsorPlans":
        return editingData.map((item: unknown, index: number) => {
          const data = item as { name: string; price: number; color: string; benefits: string[]; popular?: boolean; link?: string };
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

      case "downloadCenter": {
        // 下載專區：管理 Windows/Mac 下載連結和補丁
        const downloadCenterData = editingData as unknown as {
          downloads: { id: string; name: string; icon: string; version: string; size: string; description: string; downloadUrl: string; color: string }[];
          patches: { id: string; name: string; date: string; size: string; description: string; downloadUrl: string }[];
        };

        const updateDownloadField = (field: string, value: unknown) => {
          setEditingData({ ...downloadCenterData, [field]: value } as unknown as unknown[]);
        };

        const updateDownloadItem = (index: number, field: string, value: unknown) => {
          const newDownloads = [...downloadCenterData.downloads];
          (newDownloads[index] as Record<string, unknown>)[field] = value;
          updateDownloadField("downloads", newDownloads);
        };

        const updatePatchItem = (index: number, field: string, value: unknown) => {
          const newPatches = [...downloadCenterData.patches];
          (newPatches[index] as Record<string, unknown>)[field] = value;
          updateDownloadField("patches", newPatches);
        };

        const addPatch = () => {
          const newPatches = [...(downloadCenterData.patches || [])];
          newPatches.push({
            id: `patch-${Date.now()}`,
            name: "",
            date: new Date().toISOString().split("T")[0],
            size: "",
            description: "",
            downloadUrl: "",
          });
          updateDownloadField("patches", newPatches);
        };

        const removePatch = (index: number) => {
          const newPatches = downloadCenterData.patches.filter((_, i) => i !== index);
          updateDownloadField("patches", newPatches);
        };

        return (
          <div className="space-y-6">
            {/* 遊戲客戶端下載 */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-400" />
                遊戲客戶端下載連結
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm mb-4">
                設定 Windows 和 macOS 客戶端的下載連結（僅支援桌機版本）
              </p>
              <div className="space-y-4">
                {(downloadCenterData.downloads || []).map((download, index) => (
                  <div key={download.id} className="bg-[var(--color-bg-dark)] p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center"
                        style={{ backgroundColor: `${download.color}20` }}
                      >
                        <span style={{ color: download.color }}>
                          {download.id === "windows" ? "🖥️" : "🍎"}
                        </span>
                      </div>
                      <span className="text-[var(--color-text)] font-medium">{download.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={download.version}
                        onChange={(e) => updateDownloadItem(index, "version", e.target.value)}
                        placeholder="版本號 (如: v2.5.3)"
                        className="input"
                      />
                      <input
                        type="text"
                        value={download.size}
                        onChange={(e) => updateDownloadItem(index, "size", e.target.value)}
                        placeholder="檔案大小 (如: 3.2 GB)"
                        className="input"
                      />
                    </div>
                    <input
                      type="text"
                      value={download.description}
                      onChange={(e) => updateDownloadItem(index, "description", e.target.value)}
                      placeholder="描述 (如: 適用於 Windows 10/11)"
                      className="input w-full"
                    />
                    <input
                      type="url"
                      value={download.downloadUrl}
                      onChange={(e) => updateDownloadItem(index, "downloadUrl", e.target.value)}
                      placeholder="下載連結 (如: https://drive.google.com/...)"
                      className="input w-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 更新補丁 */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-green-400" />
                更新補丁
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm mb-4">
                管理遊戲更新補丁，每個補丁可設定獨立的下載連結
              </p>
              <div className="space-y-4">
                {(downloadCenterData.patches || []).map((patch, index) => (
                  <div key={patch.id} className="bg-[var(--color-bg-dark)] p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-text-muted)] text-sm">補丁 #{index + 1}</span>
                      <button
                        onClick={() => removePatch(index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={patch.name}
                        onChange={(e) => updatePatchItem(index, "name", e.target.value)}
                        placeholder="補丁名稱 (如: 更新補丁 v2.5.3)"
                        className="input"
                      />
                      <input
                        type="text"
                        value={patch.date}
                        onChange={(e) => updatePatchItem(index, "date", e.target.value)}
                        placeholder="發布日期 (如: 2024-12-01)"
                        className="input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={patch.size}
                        onChange={(e) => updatePatchItem(index, "size", e.target.value)}
                        placeholder="檔案大小 (如: 256 MB)"
                        className="input"
                      />
                      <input
                        type="text"
                        value={patch.description}
                        onChange={(e) => updatePatchItem(index, "description", e.target.value)}
                        placeholder="描述"
                        className="input"
                      />
                    </div>
                    <input
                      type="url"
                      value={patch.downloadUrl}
                      onChange={(e) => updatePatchItem(index, "downloadUrl", e.target.value)}
                      placeholder="補丁下載連結 (如: https://drive.google.com/...)"
                      className="input w-full"
                    />
                  </div>
                ))}
                <button
                  onClick={addPatch}
                  className="text-green-400 text-sm hover:underline flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  新增補丁
                </button>
              </div>
            </div>
          </div>
        );
      }

      case "beginnerGuides":
        return editingData.map((item: unknown, index: number) => {
          const data = item as { chapter: number; title: string; desc: string; image?: string; images?: string[]; content?: string };
          // 兼容舊資料：如果有 image 但沒有 images，將 image 轉為 images 陣列
          const images = data.images || (data.image ? [data.image] : []);

          const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            for (const file of Array.from(files)) {
              const formData = new FormData();
              formData.append("file", file);

              try {
                const res = await fetch("/api/upload", {
                  method: "POST",
                  body: formData,
                });
                const result = await res.json();
                if (result.url) {
                  const currentImages = [...images, result.url];
                  updateItem(index, "images", currentImages);
                  // 同時清除舊的 image 欄位
                  updateItem(index, "image", undefined);
                } else {
                  setError("圖片上傳失敗");
                }
              } catch {
                setError("圖片上傳失敗");
              }
            }
            // 清空 input 以便重複上傳同檔案
            e.target.value = "";
          };

          const removeImage = (imgIndex: number) => {
            const newImages = images.filter((_, i) => i !== imgIndex);
            updateItem(index, "images", newImages);
          };

          const moveImage = (imgIndex: number, direction: "up" | "down") => {
            if (direction === "up" && imgIndex === 0) return;
            if (direction === "down" && imgIndex === images.length - 1) return;
            const newImages = [...images];
            const swapIndex = direction === "up" ? imgIndex - 1 : imgIndex + 1;
            [newImages[imgIndex], newImages[swapIndex]] = [newImages[swapIndex], newImages[imgIndex]];
            updateItem(index, "images", newImages);
          };

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
              <div>
                <label className="text-[var(--color-text)] text-sm mb-2 block">
                  攻略圖片 ({images.length} 張)
                </label>
                <div className="flex gap-2 mb-3">
                  <label className="btn btn-secondary cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Plus className="w-4 h-4 mr-1" />
                    新增圖片
                  </label>
                  {images.length > 0 && (
                    <button
                      onClick={() => updateItem(index, "images", [])}
                      className="btn btn-secondary text-red-400"
                    >
                      清除全部
                    </button>
                  )}
                </div>
                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((img, imgIndex) => (
                      <div key={imgIndex} className="relative group rounded-lg overflow-hidden border border-[var(--color-border)]">
                        <img src={img} alt={`圖片 ${imgIndex + 1}`} className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => moveImage(imgIndex, "up")}
                            disabled={imgIndex === 0}
                            className="p-1.5 rounded bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="往前移"
                          >
                            <ArrowLeft className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={() => removeImage(imgIndex)}
                            className="p-1.5 rounded bg-red-500/80 hover:bg-red-500"
                            title="刪除"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={() => moveImage(imgIndex, "down")}
                            disabled={imgIndex === images.length - 1}
                            className="p-1.5 rounded bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="往後移"
                          >
                            <ArrowLeft className="w-4 h-4 text-white rotate-180" />
                          </button>
                        </div>
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                          {imgIndex + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[var(--color-text)] text-sm mb-2 block">詳細內容 (支援 HTML)</label>
                <textarea
                  value={data.content || ""}
                  onChange={(e) => updateItem(index, "content", e.target.value)}
                  placeholder="<p>詳細的攻略內容...</p>"
                  className="input w-full min-h-[150px] font-mono text-sm"
                />
              </div>
            </div>
          );
        });

      case "dropItems":
        return (
          <>
            {/* 新增方式選擇區塊 */}
            <div className="card p-4 mb-4">
              <h3 className="text-[var(--color-text)] font-medium mb-4">新增掉落資料</h3>
              <div className="flex flex-wrap gap-3">
                {/* 手動新增按鈕 */}
                <button
                  onClick={addItem}
                  className="btn btn-primary text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  手動新增 BOSS
                </button>

                {/* Excel 導入按鈕 */}
                <button
                  onClick={() => setShowExcelImport(!showExcelImport)}
                  className={`btn text-sm flex items-center gap-2 ${showExcelImport ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  從 Excel 批量導入
                </button>
              </div>

              {/* Excel 導入展開區塊 */}
              {showExcelImport && (
                <div className="space-y-4 mt-4 pt-4 border-t border-[var(--color-border)]">
                  <div className="bg-[var(--color-bg-dark)] p-3 rounded-lg">
                    <p className="text-[var(--color-text-muted)] text-sm mb-2">
                      <strong className="text-[var(--color-text)]">Excel 格式要求：</strong>
                    </p>
                    <ul className="text-[var(--color-text-muted)] text-xs list-disc list-inside space-y-1">
                      <li>第一行必須是標題行：<code className="bg-[var(--color-bg-card)] px-1 rounded">分類</code>、<code className="bg-[var(--color-bg-card)] px-1 rounded">BOSS</code>、<code className="bg-[var(--color-bg-card)] px-1 rounded">出生地點</code>、<code className="bg-[var(--color-bg-card)] px-1 rounded">物品</code></li>
                      <li>物品欄位以空格分隔多個物品</li>
                      <li>分類欄位可以留空（例如：世界BOSS、副本BOSS）</li>
                      <li>只支援 .xlsx 或 .xls 格式</li>
                      <li><strong className="text-[var(--color-primary)]">可一次選擇多個檔案</strong>，所有資料會自動合併</li>
                    </ul>
                  </div>

                  {/* 檔案選擇 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <label className="btn btn-secondary cursor-pointer flex items-center gap-2 text-sm">
                        <Upload className="w-4 h-4" />
                        選擇 Excel 檔案
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          multiple
                          onChange={handleExcelFileChange}
                          className="hidden"
                        />
                      </label>
                      {excelFiles.length > 0 && (
                        <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
                          <FileSpreadsheet className="w-4 h-4 text-green-500" />
                          <span>已選擇 {excelFiles.length} 個檔案</span>
                          <button
                            onClick={resetExcelImport}
                            className="text-red-400 hover:text-red-300 text-xs underline"
                          >
                            清除全部
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 檔案列表 */}
                    {excelFiles.length > 0 && (
                      <div className="bg-[var(--color-bg-dark)] p-3 rounded-lg space-y-2 max-h-40 overflow-y-auto">
                        {excelFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between gap-2 p-2 bg-[var(--color-bg-card)] rounded">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileSpreadsheet className="w-4 h-4 text-green-500 shrink-0" />
                              <span className="text-[var(--color-text)] text-sm truncate">{file.name}</span>
                              <span className="text-[var(--color-text-muted)] text-xs shrink-0">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <button
                              onClick={() => removeExcelFile(index)}
                              className="text-red-400 hover:text-red-300 p-1 shrink-0"
                              title="移除此檔案"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 解析按鈕 */}
                  {excelFiles.length > 0 && !excelPreviewData && (
                    <button
                      onClick={handleParseExcel}
                      disabled={excelParsing}
                      className="btn btn-primary text-sm"
                    >
                      {excelParsing ? `解析中... (${excelFiles.length} 個檔案)` : `解析並預覽 (${excelFiles.length} 個檔案)`}
                    </button>
                  )}

                  {/* 錯誤訊息 */}
                  {excelError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 text-sm font-medium">{excelError}</p>
                        {excelParseErrors.length > 0 && (
                          <ul className="mt-2 text-red-400/80 text-xs list-disc list-inside">
                            {excelParseErrors.slice(0, 5).map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                            {excelParseErrors.length > 5 && (
                              <li>... 還有 {excelParseErrors.length - 5} 個錯誤</li>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 預覽資料 */}
                  {excelPreviewData && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-[var(--color-text)] text-sm font-medium">
                          預覽資料（共 {excelPreviewData.length} 筆 BOSS）
                        </h4>
                        <div className="flex gap-2">
                          <button
                            onClick={resetExcelImport}
                            className="btn btn-secondary text-xs py-1 px-2"
                          >
                            重新選擇
                          </button>
                          <button
                            onClick={handleApplyExcelData}
                            className="btn btn-primary text-xs py-1 px-2 flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            套用資料
                          </button>
                        </div>
                      </div>

                      {excelParseErrors.length > 0 && (
                        <div className="mb-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                          <p className="text-yellow-400 text-xs">
                            注意：有 {excelParseErrors.length} 行資料無法解析，已跳過
                          </p>
                        </div>
                      )}

                      <div className="max-h-64 overflow-y-auto border border-[var(--color-border)] rounded-lg">
                        <table className="w-full text-xs">
                          <thead className="bg-[var(--color-bg-dark)] sticky top-0">
                            <tr>
                              <th className="text-left p-2 text-[var(--color-text-muted)]">#</th>
                              <th className="text-left p-2 text-[var(--color-text-muted)]">分類</th>
                              <th className="text-left p-2 text-[var(--color-text-muted)]">BOSS</th>
                              <th className="text-left p-2 text-[var(--color-text-muted)]">出生地點</th>
                              <th className="text-left p-2 text-[var(--color-text-muted)]">掉落物品數</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(excelPreviewData as { boss: string; location: string; category?: string; drops: unknown[] }[]).map((item, idx) => (
                              <tr key={idx} className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-dark)]/50">
                                <td className="p-2 text-[var(--color-text-muted)]">{idx + 1}</td>
                                <td className="p-2 text-[var(--color-text-muted)]">
                                  {item.category ? (
                                    <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-1.5 py-0.5 rounded text-xs">
                                      {item.category}
                                    </span>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td className="p-2 text-[var(--color-text)] font-medium">{item.boss}</td>
                                <td className="p-2 text-[var(--color-text-muted)] max-w-[120px] truncate" title={item.location}>
                                  {item.location || "-"}
                                </td>
                                <td className="p-2 text-[var(--color-text-muted)]">
                                  <span className="bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-1.5 py-0.5 rounded text-xs">
                                    {item.drops?.length || 0} 個
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <p className="mt-2 text-[var(--color-text-muted)] text-xs">
                        點擊「套用資料」後，資料會載入到下方編輯區，您需要再點擊「儲存變更」才會正式存到資料庫
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* BOSS 列表 */}
            {editingData.map((item: unknown, index: number) => {
              const data = item as { boss: string; location: string; category?: string; drops: { name: string }[] };
              return (
                <div key={index} className="card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-primary)] font-medium">BOSS #{index + 1}</span>
                    <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={data.boss}
                      onChange={(e) => updateItem(index, "boss", e.target.value)}
                      placeholder="BOSS 名稱 (如: 呂布)"
                      className="input"
                    />
                    <input
                      type="text"
                      value={data.location}
                      onChange={(e) => updateItem(index, "location", e.target.value)}
                      placeholder="出沒地點 (如: 虎牢關)"
                      className="input"
                    />
                    <input
                      type="text"
                      value={data.category || ""}
                      onChange={(e) => updateItem(index, "category", e.target.value)}
                      placeholder="分類 (如: 世界BOSS)"
                      className="input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[var(--color-text)] text-sm flex items-center gap-2">
                      <Gift className="w-4 h-4 text-[var(--color-primary)]" />
                      掉落物品列表
                    </label>
                    {(data.drops || []).map((drop, dIndex) => (
                      <div key={dIndex} className="flex items-center gap-2 bg-[var(--color-bg-dark)] p-3 rounded-lg">
                        <input
                          type="text"
                          value={drop.name}
                          onChange={(e) => updateNestedItem(index, "drops", dIndex, "name", e.target.value)}
                          placeholder="物品名稱"
                          className="input flex-1"
                        />
                        <button
                          onClick={() => removeNestedItem(index, "drops", dIndex)}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addNestedItem(index, "drops", { name: "" })}
                      className="text-[var(--color-primary)] text-sm hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      新增掉落物品
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        );

      case "dungeons":
        return editingData.map((item: unknown, index: number) => {
          const data = item as { name: string; image?: string; cooldown?: string; dungeonTime?: string; players: string; monsters?: { name: string; drops: string[] }[] };

          const handleDungeonImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const formData = new FormData();
            formData.append("file", file);
            try {
              const res = await fetch("/api/upload", { method: "POST", body: formData });
              const result = await res.json();
              if (result.url) {
                updateItem(index, "image", result.url);
              } else {
                setError("圖片上傳失敗");
              }
            } catch {
              setError("圖片上傳失敗");
            }
          };

          const addMonster = () => {
            const newMonsters = [...(data.monsters || []), { name: "", drops: [] }];
            updateItem(index, "monsters", newMonsters);
          };

          const updateMonster = (mIndex: number, field: string, value: unknown) => {
            const newMonsters = [...(data.monsters || [])];
            (newMonsters[mIndex] as Record<string, unknown>)[field] = value;
            updateItem(index, "monsters", newMonsters);
          };

          const removeMonster = (mIndex: number) => {
            const newMonsters = (data.monsters || []).filter((_, i) => i !== mIndex);
            updateItem(index, "monsters", newMonsters);
          };

          return (
            <div key={index} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-primary)] font-medium">副本 #{index + 1}</span>
                <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 放置圖片 */}
              <div>
                <label className="text-[var(--color-text)] text-sm mb-2 block">放置圖片</label>
                <div className="flex gap-2">
                  <label className="btn btn-secondary cursor-pointer text-sm">
                    <input type="file" accept="image/*" onChange={handleDungeonImageUpload} className="hidden" />
                    選擇圖片
                  </label>
                  {data.image && (
                    <button onClick={() => updateItem(index, "image", "")} className="btn btn-secondary text-red-400 text-sm">
                      移除圖片
                    </button>
                  )}
                </div>
                {data.image && (
                  <div className="mt-2 relative rounded-lg overflow-hidden border border-[var(--color-border)]">
                    <img src={data.image} alt="預覽" className="w-full h-32 object-cover" />
                  </div>
                )}
              </div>

              {/* 副本名稱 */}
              <input
                type="text"
                value={data.name}
                onChange={(e) => updateItem(index, "name", e.target.value)}
                placeholder="副本名稱"
                className="input w-full"
              />

              {/* 間隔時間、副本時間、人數限制 */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[var(--color-text-muted)] text-xs mb-1 block">間隔時間</label>
                  <input
                    type="text"
                    value={data.cooldown || ""}
                    onChange={(e) => updateItem(index, "cooldown", e.target.value)}
                    placeholder="如: 每日1次"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="text-[var(--color-text-muted)] text-xs mb-1 block">副本時間</label>
                  <input
                    type="text"
                    value={data.dungeonTime || ""}
                    onChange={(e) => updateItem(index, "dungeonTime", e.target.value)}
                    placeholder="如: 30分鐘"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="text-[var(--color-text-muted)] text-xs mb-1 block">人數限制</label>
                  <input
                    type="text"
                    value={data.players}
                    onChange={(e) => updateItem(index, "players", e.target.value)}
                    placeholder="如: 1-5人"
                    className="input w-full"
                  />
                </div>
              </div>

              {/* 怪物與掉落物 */}
              <div className="space-y-2">
                <label className="text-[var(--color-text)] text-sm flex items-center gap-2">
                  <Skull className="w-4 h-4 text-red-400" />
                  怪物與掉落物
                </label>
                {(data.monsters || []).map((monster, mIndex) => (
                  <div key={mIndex} className="bg-[var(--color-bg-dark)] p-3 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-text-muted)] text-xs">怪物 #{mIndex + 1}</span>
                      <button onClick={() => removeMonster(mIndex)} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={monster.name}
                      onChange={(e) => updateMonster(mIndex, "name", e.target.value)}
                      placeholder="怪物名稱"
                      className="input w-full"
                    />
                    <div>
                      <label className="text-[var(--color-text-muted)] text-xs mb-1 block">掉落物品 (每行一個)</label>
                      <textarea
                        value={(monster.drops || []).join("\n")}
                        onChange={(e) => updateMonster(mIndex, "drops", e.target.value.split("\n").filter(Boolean))}
                        placeholder="傳說武器&#10;元寶 x500&#10;稀有材料"
                        className="input w-full min-h-[60px]"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={addMonster}
                  className="text-[var(--color-primary)] text-sm hover:underline flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  新增怪物
                </button>
              </div>
            </div>
          );
        });

      case "treasureBoxes":
        return editingData.map((item: unknown, index: number) => {
          const data = item as { name: string; items: string[] };
          return (
            <div key={index} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-primary)] font-medium">寶箱 #{index + 1}</span>
                <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={data.name}
                onChange={(e) => updateItem(index, "name", e.target.value)}
                placeholder="寶箱名稱"
                className="input w-full"
              />
              <div>
                <label className="text-[var(--color-text)] text-sm mb-2 block">內容物 (每行一個)</label>
                <textarea
                  value={(data.items || []).join("\n")}
                  onChange={(e) => updateItem(index, "items", e.target.value.split("\n").filter(Boolean))}
                  placeholder="赤兔馬&#10;傳說武器&#10;元寶 x1000"
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

      case "nationWar": {
        // 國戰整合區塊：時間表、規則、獎勵、陣營、陣營圖片
        const nationWarData = editingData as unknown as {
          warSchedule: { day: string; time: string; type: string; highlight: boolean }[];
          rules: { title: string; items: string[] }[];
          rewards: { rank: string; items: string[]; image?: string }[];
          factions: { name: string; color: string; leader: string; description: string; bonus: string }[];
          factionsImage: string;
        };

        const updateNationWarField = (field: string, value: unknown) => {
          setEditingData({ ...nationWarData, [field]: value } as unknown as unknown[]);
        };

        const updateNationWarArrayItem = (field: string, index: number, subField: string, value: unknown) => {
          const arr = [...(nationWarData as Record<string, unknown[]>)[field]] as Record<string, unknown>[];
          arr[index][subField] = value;
          setEditingData({ ...nationWarData, [field]: arr } as unknown as unknown[]);
        };

        const addNationWarArrayItem = (field: string, template: unknown) => {
          const arr = [...((nationWarData as Record<string, unknown[]>)[field] || [])];
          arr.push(JSON.parse(JSON.stringify(template)));
          setEditingData({ ...nationWarData, [field]: arr } as unknown as unknown[]);
        };

        const removeNationWarArrayItem = (field: string, index: number) => {
          const arr = [...(nationWarData as Record<string, unknown[]>)[field]];
          arr.splice(index, 1);
          setEditingData({ ...nationWarData, [field]: arr } as unknown as unknown[]);
        };

        const handleFactionsImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const formData = new FormData();
          formData.append("file", file);
          try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const result = await res.json();
            if (result.url) {
              updateNationWarField("factionsImage", result.url);
            } else {
              setError("圖片上傳失敗");
            }
          } catch {
            setError("圖片上傳失敗");
          }
        };

        return (
          <div className="space-y-6">
            {/* 國戰時間表 */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <Swords className="w-5 h-5 text-violet-400" />
                每週時間表
              </h3>
              <div className="space-y-3">
                {(nationWarData.warSchedule || []).map((schedule, index) => (
                  <div key={index} className="bg-[var(--color-bg-dark)] p-3 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-text-muted)] text-sm">時段 #{index + 1}</span>
                      <button onClick={() => removeNationWarArrayItem("warSchedule", index)} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input type="text" value={schedule.day} onChange={(e) => updateNationWarArrayItem("warSchedule", index, "day", e.target.value)} placeholder="週六" className="input" />
                      <input type="text" value={schedule.time} onChange={(e) => updateNationWarArrayItem("warSchedule", index, "time", e.target.value)} placeholder="19:00-22:00" className="input" />
                      <input type="text" value={schedule.type} onChange={(e) => updateNationWarArrayItem("warSchedule", index, "type", e.target.value)} placeholder="國戰" className="input" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={schedule.highlight} onChange={(e) => updateNationWarArrayItem("warSchedule", index, "highlight", e.target.checked)} className="w-4 h-4" />
                      <span className="text-[var(--color-text)] text-sm">重點活動</span>
                    </label>
                  </div>
                ))}
                <button onClick={() => addNationWarArrayItem("warSchedule", { day: "", time: "", type: "", highlight: false })} className="text-violet-400 text-sm hover:underline flex items-center gap-1">
                  <Plus className="w-4 h-4" /> 新增時段
                </button>
              </div>
            </div>

            {/* 國戰規則 */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <Flag className="w-5 h-5 text-blue-400" />
                國戰規則
              </h3>
              <div className="space-y-3">
                {(nationWarData.rules || []).map((rule, index) => (
                  <div key={index} className="bg-[var(--color-bg-dark)] p-3 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-text-muted)] text-sm">規則 #{index + 1}</span>
                      <button onClick={() => removeNationWarArrayItem("rules", index)} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input type="text" value={rule.title} onChange={(e) => updateNationWarArrayItem("rules", index, "title", e.target.value)} placeholder="規則標題 (如: 參戰資格)" className="input w-full" />
                    <textarea
                      value={(rule.items || []).join("\n")}
                      onChange={(e) => updateNationWarArrayItem("rules", index, "items", e.target.value.split("\n").filter(Boolean))}
                      placeholder="規則內容 (每行一條)"
                      className="input w-full min-h-[80px]"
                    />
                  </div>
                ))}
                <button onClick={() => addNationWarArrayItem("rules", { title: "", items: [] })} className="text-blue-400 text-sm hover:underline flex items-center gap-1">
                  <Plus className="w-4 h-4" /> 新增規則
                </button>
              </div>
            </div>

            {/* 戰爭獎勵 */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                戰爭獎勵
              </h3>
              <div className="space-y-3">
                {(nationWarData.rewards || []).map((reward, index) => {
                  const handleRewardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("file", file);
                    try {
                      const res = await fetch("/api/upload", { method: "POST", body: formData });
                      const result = await res.json();
                      if (result.url) {
                        updateNationWarArrayItem("rewards", index, "image", result.url);
                      } else {
                        setError("圖片上傳失敗");
                      }
                    } catch {
                      setError("圖片上傳失敗");
                    }
                  };

                  return (
                    <div key={index} className="bg-[var(--color-bg-dark)] p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--color-text-muted)] text-sm">獎勵 #{index + 1}</span>
                        <button onClick={() => removeNationWarArrayItem("rewards", index)} className="text-red-400 hover:text-red-300 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input type="text" value={reward.rank} onChange={(e) => updateNationWarArrayItem("rewards", index, "rank", e.target.value)} placeholder="名次 (如: 冠軍陣營)" className="input w-full" />
                      <textarea
                        value={(reward.items || []).join("\n")}
                        onChange={(e) => updateNationWarArrayItem("rewards", index, "items", e.target.value.split("\n").filter(Boolean))}
                        placeholder="獎勵內容 (每行一項)"
                        className="input w-full min-h-[80px]"
                      />
                      <div>
                        <label className="text-[var(--color-text-muted)] text-xs mb-1 block">獎勵圖片</label>
                        <div className="flex gap-2">
                          <label className="btn btn-secondary cursor-pointer text-sm py-1 px-2">
                            <input type="file" accept="image/*" onChange={handleRewardImageUpload} className="hidden" />
                            選擇圖片
                          </label>
                          {reward.image && (
                            <button onClick={() => updateNationWarArrayItem("rewards", index, "image", "")} className="btn btn-secondary text-red-400 text-sm py-1 px-2">
                              移除
                            </button>
                          )}
                        </div>
                        {reward.image && (
                          <div className="mt-2 relative rounded-lg overflow-hidden border border-[var(--color-border)]">
                            <img src={reward.image} alt="預覽" className="w-full h-24 object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => addNationWarArrayItem("rewards", { rank: "", items: [], image: "" })} className="text-yellow-400 text-sm hover:underline flex items-center gap-1">
                  <Plus className="w-4 h-4" /> 新增獎勵
                </button>
              </div>
            </div>

            {/* 三國陣營 */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <Flag className="w-5 h-5 text-indigo-400" />
                三國陣營
              </h3>
              <div className="space-y-3">
                {(nationWarData.factions || []).map((faction, index) => (
                  <div key={index} className="bg-[var(--color-bg-dark)] p-3 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-text-muted)] text-sm">陣營 #{index + 1}</span>
                      <button onClick={() => removeNationWarArrayItem("factions", index)} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input type="text" value={faction.name} onChange={(e) => updateNationWarArrayItem("factions", index, "name", e.target.value)} placeholder="陣營名稱" className="input" />
                      <input type="text" value={faction.leader} onChange={(e) => updateNationWarArrayItem("factions", index, "leader", e.target.value)} placeholder="首領" className="input" />
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--color-text-muted)] text-sm">顏色</span>
                        <input type="color" value={faction.color} onChange={(e) => updateNationWarArrayItem("factions", index, "color", e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                      </div>
                    </div>
                    <input type="text" value={faction.description} onChange={(e) => updateNationWarArrayItem("factions", index, "description", e.target.value)} placeholder="陣營描述" className="input w-full" />
                    <input type="text" value={faction.bonus} onChange={(e) => updateNationWarArrayItem("factions", index, "bonus", e.target.value)} placeholder="陣營加成 (如: 攻擊力 +5%)" className="input w-full" />
                  </div>
                ))}
                <button onClick={() => addNationWarArrayItem("factions", { name: "", color: "#3b82f6", leader: "", description: "", bonus: "" })} className="text-indigo-400 text-sm hover:underline flex items-center gap-1">
                  <Plus className="w-4 h-4" /> 新增陣營
                </button>
              </div>
            </div>

            {/* 三國陣營圖片 */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <Flag className="w-5 h-5 text-purple-400" />
                三國陣營圖片
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm mb-3">此圖片將顯示在三國陣營區塊的標題與陣營卡片之間。</p>
              <div className="flex gap-2">
                <label className="btn btn-secondary cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleFactionsImageUpload} className="hidden" />
                  選擇圖片
                </label>
                {nationWarData.factionsImage && (
                  <button onClick={() => updateNationWarField("factionsImage", "")} className="btn btn-secondary text-red-400">
                    移除圖片
                  </button>
                )}
              </div>
              {nationWarData.factionsImage && (
                <div className="mt-3 relative rounded-lg overflow-hidden border border-[var(--color-border)]">
                  <img src={nationWarData.factionsImage} alt="預覽" className="w-full h-48 object-cover" />
                </div>
              )}
            </div>
          </div>
        );
      }

      case "arenaRanking": {
        // 三國排行使用物件格式，包含三種排行
        const rankingData = (editingData as unknown) as {
          levelRanking?: { rank: number; name: string; guild: string; score: number }[];
          nationWarRanking?: { rank: number; name: string; guild: string; score: number }[];
          chibiRanking?: { rank: number; name: string; guild: string; score: number }[];
        };

        const updateRankingItem = (type: string, index: number, field: string, value: unknown) => {
          const newData = { ...rankingData };
          const arr = (newData as Record<string, unknown[]>)[type] as Record<string, unknown>[];
          if (arr && arr[index]) {
            arr[index][field] = value;
          }
          setEditingData(newData as unknown as unknown[]);
        };

        const addRankingItem = (type: string) => {
          const newData = { ...rankingData };
          const arr = ((newData as Record<string, unknown[]>)[type] || []) as unknown[];
          arr.push({ rank: arr.length + 1, name: "", guild: "", score: 0 });
          (newData as Record<string, unknown[]>)[type] = arr;
          setEditingData(newData as unknown as unknown[]);
        };

        const removeRankingItem = (type: string, index: number) => {
          const newData = { ...rankingData };
          const arr = (newData as Record<string, unknown[]>)[type] as unknown[];
          arr.splice(index, 1);
          // 重新排序 rank
          arr.forEach((item, i) => {
            (item as { rank: number }).rank = i + 1;
          });
          setEditingData(newData as unknown as unknown[]);
        };

        const rankingTypes = [
          { key: "levelRanking", title: "等級排行", color: "#fbbf24" },
          { key: "nationWarRanking", title: "國戰討敵排行", color: "#ef4444" },
          { key: "chibiRanking", title: "赤壁討敵排行", color: "#f97316" },
        ];

        return (
          <div className="space-y-6">
            {rankingTypes.map((rankType) => {
              const items = (rankingData as Record<string, { rank: number; name: string; guild: string; score: number }[]>)[rankType.key] || [];
              return (
                <div key={rankType.key} className="card p-4">
                  <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2" style={{ color: rankType.color }}>
                    <Trophy className="w-4 h-4" />
                    {rankType.title}
                  </h3>
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-[var(--color-bg-dark)] rounded-lg">
                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: `${rankType.color}20`, color: rankType.color }}>
                          {item.rank}
                        </span>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateRankingItem(rankType.key, index, "name", e.target.value)}
                          placeholder="玩家名稱"
                          className="input flex-1"
                        />
                        <input
                          type="text"
                          value={item.guild}
                          onChange={(e) => updateRankingItem(rankType.key, index, "guild", e.target.value)}
                          placeholder="公會"
                          className="input w-28"
                        />
                        <input
                          type="number"
                          value={item.score}
                          onChange={(e) => updateRankingItem(rankType.key, index, "score", parseInt(e.target.value) || 0)}
                          placeholder="分數"
                          className="input w-24"
                        />
                        <button
                          onClick={() => removeRankingItem(rankType.key, index)}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addRankingItem(rankType.key)}
                      className="text-sm hover:underline flex items-center gap-1"
                      style={{ color: rankType.color }}
                    >
                      <Plus className="w-4 h-4" />
                      新增排名
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
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

                {/* 三國排行、國戰、下載專區、掉落查詢有自己的邏輯，不顯示通用新增按鈕 */}
                {activeSection !== "arenaRanking" && activeSection !== "nationWar" && activeSection !== "downloadCenter" && activeSection !== "dropItems" && (
                  <button
                    onClick={addItem}
                    className="mt-4 w-full card p-4 flex items-center justify-center gap-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors border-dashed"
                  >
                    <Plus className="w-5 h-5" />
                    新增項目
                  </button>
                )}
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
