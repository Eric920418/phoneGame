import Link from "next/link";
import { graphqlFetch } from "@/lib/apolloClient";

// 強制動態渲染，不使用緩存
export const dynamic = "force-dynamic";
export const revalidate = 0;
import {
  Bell,
  MessageSquare,
  ChevronRight,
  Flame,
  Calendar,
  Users,
  Megaphone,
  Heart,
  Download,
  Settings,
  BookOpen,
  Search,
  Map,
  Gift,
  Skull,
  Swords,
  Trophy,
  Monitor,
  Smartphone,
  FileDown,
  Clock,
  Star,
  MapPin,
  Shield,
  Crown,
  Target,
  Package,
  Zap,
  Medal,
  Flag,
  ThumbsUp,
  Quote,
} from "lucide-react";
import Image from "next/image";
import ReviewSection from "@/components/ReviewSection";
import AnnouncementSection from "@/components/AnnouncementSection";

// ==================== 介面定義 ====================
interface Announcement {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  type: string;
  isHot: boolean;
  publishedAt: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  postCount: number;
}

// ==================== 靜態數據 ====================

// 贊助方案
const sponsorPlans = [
  { name: "青銅", price: 100, color: "#cd7f32", benefits: ["500 元寶", "專屬稱號"] },
  { name: "白銀", price: 300, color: "#c0c0c0", benefits: ["2000 元寶", "稀有坐騎"] },
  { name: "黃金", price: 500, color: "#ffd700", benefits: ["5000 元寶", "傳說坐騎", "專屬時裝"], popular: true },
  { name: "鑽石", price: 1000, color: "#b9f2ff", benefits: ["15000 元寶", "神話坐騎", "永久加成"] },
];

// 下載項目結構（從 downloadCenter 轉換）
interface DownloadCenterData {
  downloads?: { id: string; downloadUrl: string }[];
  patches?: unknown[];
}

// 遊戲設定建議
const gameSettings = [
  { category: "畫面", settings: [{ name: "解析度", value: "1920x1080" }, { name: "畫質", value: "高" }] },
  { category: "音效", settings: [{ name: "主音量", value: "70%" }, { name: "背景音樂", value: "50%" }] },
  { category: "操作", settings: [{ name: "智慧施法", value: "開啟" }, { name: "自動攻擊", value: "開啟" }] },
];

// 新手攻略章節
const beginnerGuides = [
  { chapter: 1, title: "建立角色", desc: "選擇陣營與職業" },
  { chapter: 2, title: "戰鬥入門", desc: "基礎操作與技能" },
  { chapter: 3, title: "探索世界", desc: "主線與支線任務" },
  { chapter: 4, title: "加入公會", desc: "團隊合作與福利" },
];

// 掉落查詢數據 - 從資料庫讀取，不使用預設假資料
const dropItems: { boss: string; location: string; drops: { name: string; type: string }[] }[] = [];

// 副本列表
const dungeons = [
  { name: "虎牢關", level: 60, difficulty: "傳說", color: "#ff6b00", players: "5人", boss: "呂布" },
  { name: "赤壁之戰", level: 50, difficulty: "史詩", color: "#a855f7", players: "10人", boss: "曹操軍團" },
  { name: "五丈原", level: 55, difficulty: "史詩", color: "#a855f7", players: "5人", boss: "司馬懿幻影" },
  { name: "長坂坡", level: 40, difficulty: "困難", color: "#3b82f6", players: "3人", boss: "曹軍先鋒" },
];

// 寶箱福袋內容 - 空預設，使用資料庫資料
const treasureBoxes: { name: string; items: string[] }[] = [];

// BOSS 列表
const bossList = [
  { name: "呂布", title: "無雙戰神", location: "虎牢關", level: 60, type: "副本", color: "#ff6b00" },
  { name: "曹操", title: "亂世梟雄", location: "許昌皇城", level: 55, type: "世界", color: "#a855f7" },
  { name: "關羽", title: "武聖", location: "樊城", level: 50, type: "副本", color: "#ef4444" },
  { name: "諸葛亮", title: "臥龍先生", location: "五丈原", level: 55, type: "副本", color: "#3b82f6" },
];

// 國戰時間表
const warSchedule = [
  { day: "週六", time: "19:00-22:00", type: "國戰", highlight: true },
  { day: "週日", time: "19:00-22:00", type: "國戰", highlight: true },
  { day: "週五", time: "20:00-22:00", type: "公會戰", highlight: false },
  { day: "週二/四", time: "20:00-21:30", type: "資源戰", highlight: false },
];

// 三國排行數據 - 從資料庫讀取，不使用預設假資料
const arenaRanking: {
  levelRanking: { rank: number; name: string; guild: string; score: number }[];
  nationWarRanking: { rank: number; name: string; guild: string; score: number }[];
  chibiRanking: { rank: number; name: string; guild: string; score: number }[];
} = {
  levelRanking: [],
  nationWarRanking: [],
  chibiRanking: [],
};

// 玩家評價數據
const playerReviews = [
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
  {
    id: 3,
    name: "江東霸主",
    avatar: "⚔️",
    rating: 4,
    hours: 520,
    date: "2024-11-25",
    content: "遊戲整體不錯，PVP 平衡做得還行。希望能多出一些新副本，現在的內容有點刷完了。活動獎勵蠻大方的，不課金也能玩得開心。",
    helpful: 67,
    isRecommended: true,
  },
  {
    id: 4,
    name: "魏武帝",
    avatar: "👑",
    rating: 5,
    hours: 2100,
    date: "2024-11-20",
    content: "從開服玩到現在，見證了遊戲的成長。開發團隊很用心在聽取玩家意見，每次更新都有驚喜。社群氣氛很好，認識了很多朋友。五星好評！",
    helpful: 234,
    isRecommended: true,
  },
];

// ==================== 內容區塊介面 ====================
interface ContentBlocks {
  sponsorPlans?: typeof sponsorPlans;
  downloadCenter?: DownloadCenterData;
  gameSettings?: typeof gameSettings;
  beginnerGuides?: typeof beginnerGuides;
  dropItems?: typeof dropItems;
  dungeons?: typeof dungeons;
  treasureBoxes?: typeof treasureBoxes;
  bossList?: typeof bossList;
  warSchedule?: typeof warSchedule;
  factions?: { name: string; color: string; leader: string; description: string; bonus: string }[];
  arenaRanking?: typeof arenaRanking;
  playerReviews?: typeof playerReviews;
}

// ==================== 輔助函數 ====================

async function getHomeData() {
  try {
    const data = await graphqlFetch<{
      latestAnnouncements: Announcement[];
      categories: Category[];
    }>(`
      query {
        latestAnnouncements(limit: 20) {
          id
          title
          slug
          excerpt
          coverImage
          type
          isHot
          publishedAt
        }
        categories {
          id
          name
          slug
          description
          icon
          color
          postCount
        }
      }
    `, undefined, { skipCache: true });
    return data;
  } catch (error) {
    console.error("獲取首頁數據失敗:", error);
    return { latestAnnouncements: [], categories: [] };
  }
}

async function getContentBlocks(): Promise<ContentBlocks> {
  try {
    const data = await graphqlFetch<{
      contentBlocks: Array<{ key: string; payload: unknown }>;
    }>(`
      query {
        contentBlocks {
          key
          payload
        }
      }
    `, undefined, { skipCache: true });

    const blocks: ContentBlocks = {};
    data.contentBlocks.forEach((block) => {
      (blocks as Record<string, unknown>)[block.key] = block.payload;
    });
    return blocks;
  } catch (error) {
    console.error("獲取內容區塊失敗:", error);
    return {};
  }
}

function getTypeStyle(type: string) {
  switch (type) {
    case "update": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "event": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "maintenance": return "bg-red-500/10 text-red-400 border-red-500/20";
    default: return "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20";
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case "update": return "更新";
    case "event": return "活動";
    case "maintenance": return "維護";
    default: return "公告";
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" });
}

// ==================== 金屬框區塊容器組件 ====================
function FramedSection({ 
  id,
  children,
  compact = false  // compact 模式用於內容較少的區塊
}: { 
  id?: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section id={id} className="relative">
      {/* 金屬框背景 - 使用 CSS 邊框圖片 */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src="/金属框.webp"
          alt=""
          fill
          className="object-fill"
          style={{ 
            objectFit: 'fill',
          }}
        />
      </div>
      {/* 內容區域 - 超大 padding 確保內容完全在金屬框內
          上方需要特別多空間避開皇冠裝飾
          compact 模式減少上方 padding */}
      <div className={`relative z-10 px-6 pb-20 sm:px-8 sm:pb-24 md:px-10  lg:px-16 lg:pb-12 ${
        compact
          ? "pt-20 lg:pt-24"
          : "pt-32 lg:pt-54"
      }`}>
        {children}
      </div>
    </section>
  );
}

// ==================== Section 標題組件 ====================
function SectionTitle({ 
  icon: Icon, 
  title, 
  color = "var(--color-primary)",
  href 
}: { 
  icon: React.ElementType; 
  title: string; 
  color?: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-2 ">
      <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] flex items-center gap-2 sm:gap-3">
        <div 
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
        </div>
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-[var(--color-primary)] hover:text-[var(--color-primary-light)] flex items-center gap-1 text-xs sm:text-sm shrink-0"
        >
          <span className="hidden sm:inline">查看更多</span>
          <span className="sm:hidden">更多</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

// ==================== 主頁面組件 ====================
export default async function HomePage() {
  const [{ latestAnnouncements, categories }, contentBlocks] = await Promise.all([
    getHomeData(),
    getContentBlocks(),
  ]);

  // 使用数据库数据
  const displaySponsorPlans = contentBlocks.sponsorPlans || sponsorPlans;
  // 從 downloadCenter 提取下載連結（優先使用 Windows）
  const downloadCenterData = contentBlocks.downloadCenter;
  const downloadLink = downloadCenterData?.downloads?.find(d => d.id === "windows")?.downloadUrl
    || downloadCenterData?.downloads?.[0]?.downloadUrl
    || "";
  const displayGameSettings = contentBlocks.gameSettings || gameSettings;
  const displayBeginnerGuides = contentBlocks.beginnerGuides || beginnerGuides;
  const displayDropItems = contentBlocks.dropItems || dropItems;
  const displayDungeons = contentBlocks.dungeons || dungeons;
  const displayTreasureBoxes = contentBlocks.treasureBoxes || treasureBoxes;
  const displayBossList = contentBlocks.bossList || bossList;
  const displayWarSchedule = contentBlocks.warSchedule || warSchedule;
  const displayFactions = contentBlocks.factions || [];
  const displayArenaRanking = (contentBlocks.arenaRanking || arenaRanking) as {
    levelRanking?: { rank: number; name: string; guild: string; score: number }[];
    nationWarRanking?: { rank: number; name: string; guild: string; score: number }[];
    chibiRanking?: { rank: number; name: string; guild: string; score: number }[];
  };
  const displayPlayerReviews = contentBlocks.playerReviews || playerReviews;

  return (
    <div className="min-h-screen">
      {/* ==================== Hero Section ==================== */}
      {/* 手機版：自適應高度，桌面版：全屏 */}
      <section className="relative -mt-16 bg-[var(--color-bg-dark)]">
        {/* 手機版 - 使用 Image 組件自適應高度 */}
        <div className="md:hidden pt-16">
          <Image
            src="/破浪三國主視覺.webp"
            alt="破浪三國主視覺"
            width={1920}
            height={1080}
            className="w-full h-auto"
            priority
          />
        </div>
        {/* 桌面版背景 - 使用 cover 填滿全屏 */}
        <div
          className="hidden md:block h-[calc(100vh+4rem)] min-h-[600px] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/破浪三國主視覺.webp')" }}
        />
      </section>

      {/* ==================== Social Media Links Section ==================== */}
      <section className="bg-[var(--color-bg-darker)] border-y border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "LINE官方", url: "https://lin.ee/v3QB1Nh", icon: "💬" },
              { name: "LINE社群", url: "https://line.me/ti/g2/2bdAwMsiQEfaxUbufL9MIVQdIYw0Bla5W3Ta5w?utm_source=invitation&utm_medium=link_copy&utm_campaign=default", icon: "👥" },
              { name: "FB粉專", url: "https://www.facebook.com/profile.php?id=61584223575435", icon: "📘" },
              { name: "TikTok", url: "https://www.tiktok.com/@polang2025", icon: "🎵" },
            ].map((social, i) => (
              <a
                key={i}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center transition-transform hover:scale-105 cursor-pointer group"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {social.icon}
                </div>
                <div className="text-[var(--color-text)] font-medium group-hover:text-[var(--color-primary)] transition-colors">
                  {social.name}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 主要內容區 - 布料底圖背景 ==================== */}
      <div
        className="relative"
        style={{
          backgroundImage: "url('/布料底图.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* 深色遮罩層，確保文字可讀 */}
        <div className="absolute inset-0 bg-black/50" />

        {/* 內容容器 - 手機版減少左右 padding 讓金屬框有更多空間 */}
        <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8 md:space-y-12">
          {/* ==================== 1. 公告 Section ==================== */}
          <FramedSection id="announcements" compact={true}>
            <AnnouncementSection announcements={latestAnnouncements} />
          </FramedSection>

          {/* ==================== 討論區 Section ==================== */}
          <FramedSection compact={true}>
            <SectionTitle
              icon={MessageSquare}
              title="討論區"
              color="var(--color-primary)"
              href="/forum"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/forum?category=${category.slug}`}
                    className="card p-4 flex items-center gap-3 group"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      {category.icon || "💬"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[var(--color-text)] font-medium group-hover:text-[var(--color-primary)] transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-[var(--color-text-muted)] text-sm truncate">
                        {category.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[var(--color-text-dark)] text-sm shrink-0">
                      <Users className="w-4 h-4" />
                      {category.postCount}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="card p-8 text-center col-span-full">
                  <MessageSquare className="w-12 h-12 text-[var(--color-text-dark)] mx-auto mb-4" />
                  <p className="text-[var(--color-text-muted)]">暫無分類</p>
                </div>
              )}
            </div>
          </FramedSection>

          {/* ==================== 2. 贊助活動 Section ==================== */}
          <FramedSection id="sponsor" compact={true}>
            <SectionTitle
              icon={Heart}
              title="贊助活動"
              color="#e91e63"
              href="/guide/sponsor"
            />
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {displaySponsorPlans.map((plan, index) => (
                <Link
                  key={index}
                  href="/guide/sponsor"
                  className={`card p-3 sm:p-5 text-center relative transition-all hover:scale-[1.02] ${
                    plan.popular
                      ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                      : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[var(--color-primary)] text-[var(--color-bg-dark)] text-[10px] sm:text-xs font-bold whitespace-nowrap">
                      推薦
                    </div>
                  )}
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${plan.color}20` }}
                  >
                    <Crown
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      style={{ color: plan.color }}
                    />
                  </div>
                  <h3 className="font-bold text-[var(--color-text)] mb-1 text-sm sm:text-base">
                    {plan.name}
                  </h3>
                  <div
                    className="text-lg sm:text-xl font-bold mb-2 sm:mb-3"
                    style={{ color: plan.color }}
                  >
                    ${plan.price}
                  </div>
                  <ul className="text-[10px] sm:text-xs text-[var(--color-text-muted)] space-y-0.5 sm:space-y-1">
                    {plan.benefits.slice(0, 3).map((b, i) => (
                      <li key={i} className="truncate">
                        • {b}
                      </li>
                    ))}
                  </ul>
                </Link>
              ))}
            </div>
          </FramedSection>

          {/* ==================== 3. 下載專區 Section ==================== */}
          <FramedSection id="download" compact={true}>
            <SectionTitle
              icon={Download}
              title="下載專區"
              color="#3498db"
              href="/guide/download"
            />
            {downloadCenterData?.downloads && downloadCenterData.downloads.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {downloadCenterData.downloads.map((item) => {
                  const content = (
                    <>
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 text-2xl sm:text-3xl"
                        style={{ backgroundColor: item.id === "windows" ? "#0078d420" : "#55555520" }}
                      >
                        {item.id === "windows" ? (
                          <Monitor className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: "#0078d4" }} />
                        ) : (
                          <span>🍎</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[var(--color-text)] text-sm sm:text-base">
                          {item.id === "windows" ? "Windows 客戶端" : "macOS 客戶端"}
                        </h3>
                        <p className="text-[var(--color-text-muted)] text-xs sm:text-sm truncate">
                          {item.downloadUrl ? "點擊下載" : "尚未設定"}
                        </p>
                      </div>
                      <FileDown className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${
                        item.downloadUrl ? "text-blue-400" : "text-[var(--color-text-dark)]"
                      }`} />
                    </>
                  );

                  return item.downloadUrl ? (
                    <a
                      key={item.id}
                      href={item.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card p-4 sm:p-6 flex items-center gap-4 transition-all hover:scale-[1.02] hover:border-blue-500/50"
                    >
                      {content}
                    </a>
                  ) : (
                    <div
                      key={item.id}
                      className="card p-4 sm:p-6 flex items-center gap-4 opacity-50"
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-[var(--color-text-muted)] text-center py-8">
                下載連結尚未設定
              </div>
            )}
          </FramedSection>

          {/* ==================== 4. 遊戲設定 Section ==================== */}
          <FramedSection id="settings" compact={true}>
            <SectionTitle
              icon={Settings}
              title="遊戲設定"
              color="#9b59b6"
              href="/guide/settings"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {displayGameSettings.map((group: { id?: string; name?: string; category?: string; color?: string; settings: { name: string }[] }, index: number) => {
                // 優先使用 category（後台設定的組名稱），其次用 name
                const displayName = group.category || group.name || `設定組 #${index + 1}`;
                const defaultColors = ['#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#f39c12', '#1abc9c'];
                const displayColor = group.color || defaultColors[index % defaultColors.length];
                return (
                  <Link key={group.id || index} href="/guide/settings" className="card p-4 hover:border-purple-500/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${displayColor}20` }}
                      >
                        <Shield className="w-5 h-5" style={{ color: displayColor }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors text-sm sm:text-base line-clamp-1">
                          {displayName}
                        </h3>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {group.settings.length} 項設定
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[var(--color-text-dark)] group-hover:text-[var(--color-primary)] transition-colors shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </FramedSection>

          {/* ==================== 5. 新手攻略 Section ==================== */}
          <FramedSection id="beginner" compact={true}>
            <SectionTitle
              icon={BookOpen}
              title="新手攻略"
              color="#2ecc71"
              href="/guide/beginner"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {displayBeginnerGuides.slice(0, 4).map((guide) => (
                <Link
                  key={guide.chapter}
                  href={`/guide/beginner/${guide.chapter}`}
                  className="card p-3 sm:p-5 hover:border-green-500/30 transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-2 sm:mb-3">
                    <span className="text-green-400 font-bold text-sm sm:text-base">
                      {guide.chapter}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors mb-1 line-clamp-1">
                    {guide.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)] line-clamp-2">
                    {guide.desc}
                  </p>
                </Link>
              ))}
            </div>
          </FramedSection>

          {/* ==================== 6. 掉落查詢 Section ==================== */}
          <FramedSection id="drops" compact={true}>
            <SectionTitle
              icon={Search}
              title="掉落查詢"
              color="#f39c12"
              href="/guide/drops"
            />
            {/* 以 BOSS 為主的卡片式顯示 - 最多顯示 4 個，精簡版 */}
            {displayDropItems.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {displayDropItems.slice(0, 4).map((bossData, index) => (
                  <Link key={index} href="/guide/drops" className="card p-3 sm:p-4 hover:border-[#f39c12]/30 transition-all block group">
                    {/* BOSS 名稱 */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#f39c12]/10 flex items-center justify-center shrink-0">
                        <Skull className="w-4 h-4 sm:w-5 sm:h-5 text-[#f39c12]" />
                      </div>
                      <h3 className="font-bold text-[var(--color-text)] text-sm sm:text-base group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                        {bossData.boss}
                      </h3>
                    </div>
                    {/* 掉落物品 - 只顯示前三個 */}
                    <div className="space-y-1.5">
                      {(bossData.drops || []).slice(0, 3).map((drop, dIndex) => (
                        <div
                          key={dIndex}
                          className="flex items-center gap-2 text-xs sm:text-sm text-[var(--color-text-muted)]"
                        >
                          <Star className="w-3 h-3 shrink-0 text-[#f39c12]" />
                          <span className="truncate">{drop.name}</span>
                        </div>
                      ))}
                      {(bossData.drops || []).length > 3 && (
                        <div className="text-xs text-[#f39c12] pt-1">
                          +{(bossData.drops || []).length - 3} 更多...
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[#f39c12]/10 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-[#f39c12]" />
                </div>
                <p className="text-[var(--color-text-muted)]">暫無掉落資料，敬請期待</p>
              </div>
            )}
          </FramedSection>

          {/* ==================== 7. 副本介紹 Section ==================== */}
          <FramedSection id="dungeon" compact>
            <SectionTitle
              icon={Map}
              title="副本介紹"
              color="#1abc9c"
              href="/guide/dungeon"
            />
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {displayDungeons.map((dungeon, index) => (
                <Link
                  key={index}
                  href="/guide/dungeon"
                  className="card p-3 sm:p-5 hover:border-teal-500/30 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span
                      className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded"
                      style={{
                        backgroundColor: `${dungeon.color}20`,
                        color: dungeon.color,
                      }}
                    >
                      {dungeon.difficulty}
                    </span>
                    <span className="text-[10px] sm:text-xs text-[var(--color-text-dark)]">
                      Lv.{dungeon.level}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors mb-1 sm:mb-2">
                    {dungeon.name}
                  </h3>
                  <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-[var(--color-text-muted)] flex-wrap">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 shrink-0" />
                      {dungeon.players}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <Skull className="w-3 h-3 shrink-0" />
                      <span className="truncate">{dungeon.boss}</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </FramedSection>

          {/* ==================== 8. 寶箱福袋內容 Section ==================== */}
          <FramedSection id="treasure" compact={true}>
            <SectionTitle
              icon={Gift}
              title="寶箱福袋內容"
              color="#f1c40f"
              href="/guide/treasure"
            />
            {displayTreasureBoxes.length > 0 ? (
              <div className="relative">
                {/* 右側漸層提示 */}
                <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-black/50 to-transparent z-10 pointer-events-none" />

                <div className="overflow-x-auto pb-4 -mx-2 px-2 horizontal-scroll">
                  <div className="flex gap-3 sm:gap-4" style={{ minWidth: 'max-content' }}>
                    {displayTreasureBoxes.map((box, index) => (
                      <Link
                        key={index}
                        href="/guide/treasure"
                        className="card p-4 hover:border-yellow-500/30 transition-all w-[280px] sm:w-[320px] shrink-0"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Gift className="w-5 h-5 text-yellow-400 shrink-0" />
                          <h3 className="font-bold text-[var(--color-text)] truncate">{box.name}</h3>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(box.items || []).slice(0, 6).map((item, i) => {
                            const displayText = typeof item === 'string' ? item : (item as { name?: string }).name || '';
                            return (
                              <span
                                key={i}
                                className="text-xs text-[var(--color-text-muted)] py-1 px-2 rounded bg-[var(--color-bg-darker)]"
                              >
                                {displayText}
                              </span>
                            );
                          })}
                          {(box.items || []).length > 6 && (
                            <span className="text-xs text-yellow-400 py-1 px-2">
                              +{box.items.length - 6}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-6 h-6 text-yellow-400" />
                </div>
                <p className="text-[var(--color-text-muted)]">暫無寶箱資料</p>
              </div>
            )}
          </FramedSection>



          {/* ==================== 10. 國戰時間 Section ==================== */}
          <FramedSection id="nation-war" compact={true}>
            <SectionTitle
              icon={Swords}
              title="國戰時間"
              color="#8e44ad"
              href="/guide/nation-war"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* 時間表 */}
              <Link href="/guide/nation-war" className="card p-4 h-[300px] flex flex-col hover:border-violet-500/30 transition-all">
                <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2 text-sm sm:text-base shrink-0">
                  <Clock className="w-4 h-4 text-violet-400" />
                  每週時程表
                </h3>
                <div className="space-y-2 sm:space-y-3 overflow-y-auto flex-1">
                  {displayWarSchedule.map((schedule, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${
                        schedule.highlight
                          ? "bg-violet-500/10 border border-violet-500/30"
                          : "bg-[var(--color-bg-darker)]"
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <span
                          className={`font-medium text-sm shrink-0 ${
                            schedule.highlight
                              ? "text-violet-400"
                              : "text-[var(--color-text)]"
                          }`}
                        >
                          {schedule.day}
                        </span>
                        <span
                          className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded shrink-0 ${
                            schedule.highlight
                              ? "bg-violet-500/20 text-violet-400"
                              : "bg-[var(--color-bg-card)] text-[var(--color-text-muted)]"
                          }`}
                        >
                          {schedule.type}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm text-[var(--color-text-muted)] shrink-0">
                        {schedule.time}
                      </span>
                    </div>
                  ))}
                </div>
              </Link>

              {/* 三國陣營 */}
              <Link href="/guide/nation-war" className="card p-4 h-[300px] flex flex-col hover:border-violet-500/30 transition-all overflow-hidden">
                <h3 className="font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2 text-sm sm:text-base shrink-0">
                  <Flag className="w-4 h-4 text-violet-400" />
                  三國陣營
                </h3>
                <div className="space-y-2 sm:space-y-3 overflow-y-auto flex-1">
                  {displayFactions.length > 0 ? (
                    displayFactions.map((faction, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-[var(--color-bg-darker)]"
                        style={{ borderLeft: `3px solid ${faction.color}` }}
                      >
                        <div className="min-w-0 flex-1">
                          <span
                            className="font-bold text-sm"
                            style={{ color: faction.color }}
                          >
                            {faction.name}
                          </span>
                          <p className="text-xs text-[var(--color-text-muted)] truncate">
                            {faction.leader && `${faction.leader}為首`}
                          </p>
                        </div>
                        {faction.bonus && (
                          <span
                            className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-1 rounded shrink-0 ml-2"
                            style={{
                              backgroundColor: `${faction.color}20`,
                              color: faction.color,
                            }}
                          >
                            {faction.bonus}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-[var(--color-text-muted)] text-sm">
                      暫無陣營資料
                    </div>
                  )}
                </div>
              </Link>
            </div>
          </FramedSection>

          {/* ==================== 11. 三國排行 Section ==================== */}
          <FramedSection id="arena" compact={true}>
            <SectionTitle
              icon={Trophy}
              title="三國排行"
              color="#c9a227"
              href="/guide/arena"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* 等級排行 */}
              <Link href="/guide/arena" className="card p-4 h-[350px] flex flex-col hover:border-amber-500/30 transition-all">
                <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2 text-sm sm:text-base shrink-0">
                  <Medal className="w-4 h-4 text-amber-400" />
                  等級排行
                </h3>
                <div className="space-y-2 overflow-y-auto flex-1">
                  {(displayArenaRanking.levelRanking || []).map((player) => (
                    <div
                      key={player.rank}
                      className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-[var(--color-bg-darker)]"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <span
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 ${
                            player.rank === 1
                              ? "bg-yellow-500/20 text-yellow-400"
                              : player.rank === 2
                              ? "bg-gray-400/20 text-gray-300"
                              : player.rank === 3
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-[var(--color-bg-card)] text-[var(--color-text-muted)]"
                          }`}
                        >
                          {player.rank}
                        </span>
                        <div className="min-w-0">
                          <span
                            className={`font-medium text-sm truncate block ${
                              player.rank <= 3
                                ? "text-[var(--color-primary)]"
                                : "text-[var(--color-text)]"
                            }`}
                          >
                            {player.name}
                          </span>
                          <p className="text-[10px] sm:text-xs text-[var(--color-text-dark)] truncate">
                            {player.guild}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-amber-400 text-sm sm:text-base shrink-0 ml-2">
                        Lv.{player.score}
                      </span>
                    </div>
                  ))}
                </div>
              </Link>

              {/* 國戰討敵排行 */}
              <Link href="/guide/arena" className="card p-4 h-[350px] flex flex-col hover:border-red-500/30 transition-all">
                <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2 text-sm sm:text-base shrink-0">
                  <Swords className="w-4 h-4 text-red-400" />
                  國戰討敵排行
                </h3>
                <div className="space-y-2 overflow-y-auto flex-1">
                  {(displayArenaRanking.nationWarRanking || []).map((player) => (
                    <div
                      key={player.rank}
                      className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-[var(--color-bg-darker)]"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <span
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 ${
                            player.rank === 1
                              ? "bg-yellow-500/20 text-yellow-400"
                              : player.rank === 2
                              ? "bg-gray-400/20 text-gray-300"
                              : player.rank === 3
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-[var(--color-bg-card)] text-[var(--color-text-muted)]"
                          }`}
                        >
                          {player.rank}
                        </span>
                        <div className="min-w-0">
                          <span
                            className={`font-medium text-sm truncate block ${
                              player.rank <= 3
                                ? "text-[var(--color-primary)]"
                                : "text-[var(--color-text)]"
                            }`}
                          >
                            {player.name}
                          </span>
                          <p className="text-[10px] sm:text-xs text-[var(--color-text-dark)] truncate">
                            {player.guild}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-red-400 text-sm sm:text-base shrink-0 ml-2">
                        {player.score}
                      </span>
                    </div>
                  ))}
                </div>
              </Link>

              {/* 赤壁討敵排行 */}
              <Link href="/guide/arena" className="card p-4 h-[350px] flex flex-col hover:border-orange-500/30 transition-all">
                <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2 text-sm sm:text-base shrink-0">
                  <Flame className="w-4 h-4 text-orange-400" />
                  赤壁討敵排行
                </h3>
                <div className="space-y-2 overflow-y-auto flex-1">
                  {(displayArenaRanking.chibiRanking || []).map((player) => (
                    <div
                      key={player.rank}
                      className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-[var(--color-bg-darker)]"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <span
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 ${
                            player.rank === 1
                              ? "bg-yellow-500/20 text-yellow-400"
                              : player.rank === 2
                              ? "bg-gray-400/20 text-gray-300"
                              : player.rank === 3
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-[var(--color-bg-card)] text-[var(--color-text-muted)]"
                          }`}
                        >
                          {player.rank}
                        </span>
                        <div className="min-w-0">
                          <span
                            className={`font-medium text-sm truncate block ${
                              player.rank <= 3
                                ? "text-[var(--color-primary)]"
                                : "text-[var(--color-text)]"
                            }`}
                          >
                            {player.name}
                          </span>
                          <p className="text-[10px] sm:text-xs text-[var(--color-text-dark)] truncate">
                            {player.guild}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-orange-400 text-sm sm:text-base shrink-0 ml-2">
                        {player.score}
                      </span>
                    </div>
                  ))}
                </div>
              </Link>
            </div>
          </FramedSection>

          {/* ==================== 12. 玩家評價 Section ==================== */}
          <section id="reviews">
            <SectionTitle icon={Quote} title="玩家評價" color="#10b981" />
            <ReviewSection />
          </section>
        </div>
      </div>

      {/* ==================== 快速導航 Footer ==================== */}
      <section className="bg-[var(--color-bg-darker)] border-t border-[var(--color-border)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-[var(--color-primary)] font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                攻略專區
              </h3>
              <ul className="space-y-2">
                {["新手攻略", "副本介紹"].map((item, i) => (
                  <li key={i}>
                    <a
                      href={`#${["beginner", "dungeon", "boss"][i]}`}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[var(--color-primary)] font-semibold mb-4 flex items-center gap-2">
                <Search className="w-4 h-4" />
                資料查詢
              </h3>
              <ul className="space-y-2">
                {["掉落查詢", "寶箱福袋內容", "遊戲設定"].map((item, i) => (
                  <li key={i}>
                    <a
                      href={`#${["drops", "treasure", "settings"][i]}`}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[var(--color-primary)] font-semibold mb-4 flex items-center gap-2">
                <Swords className="w-4 h-4" />
                競技活動
              </h3>
              <ul className="space-y-2">
                {["國戰時間", "三國排行", "活動公告"].map((item, i) => (
                  <li key={i}>
                    <a
                      href={`#${["nation-war", "arena", "announcements"][i]}`}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[var(--color-primary)] font-semibold mb-4 flex items-center gap-2">
                <Download className="w-4 h-4" />
                服務支援
              </h3>
              <ul className="space-y-2">
                {["下載專區", "贊助活動", "討論區"].map((item, i) => (
                  <li key={i}>
                    <a
                      href={`#${["download", "sponsor", ""][i]}`}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
