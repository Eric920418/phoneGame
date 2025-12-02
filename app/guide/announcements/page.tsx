import { Megaphone, Calendar, Tag, ChevronRight } from "lucide-react";
import Link from "next/link";

/**
 * 活動公告頁面
 * 展示遊戲內各種活動與公告資訊
 */

// 模擬活動數據 - 之後可以從資料庫獲取
const events = [
  {
    id: 1,
    title: "雙十二狂歡活動",
    date: "2024-12-12",
    endDate: "2024-12-15",
    type: "限時活動",
    description: "登入即送稀有道具，儲值加碼 50%！",
    isHot: true,
  },
  {
    id: 2,
    title: "新武將「諸葛亮」限時登場",
    date: "2024-12-10",
    endDate: "2024-12-20",
    type: "新內容",
    description: "傳說級智將，掌握逆轉戰局的關鍵力量。",
    isHot: true,
  },
  {
    id: 3,
    title: "每週挑戰賽事",
    date: "2024-12-08",
    endDate: "2024-12-14",
    type: "競技",
    description: "參與每週挑戰，贏取豐厚獎勵。",
    isHot: false,
  },
  {
    id: 4,
    title: "公會招募活動",
    date: "2024-12-01",
    endDate: "2024-12-31",
    type: "社群",
    description: "加入公會享受團隊福利，共同征戰天下！",
    isHot: false,
  },
];

export default function AnnouncementsPage() {
  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center">
          <Megaphone className="w-7 h-7 text-red-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">活動公告</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            最新活動資訊與遊戲更新公告
          </p>
        </div>
      </div>

      {/* 活動列表 */}
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="card p-6 group hover:border-red-500/30 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {/* 熱門標籤 */}
                  {event.isHot && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold">
                      🔥 熱門
                    </span>
                  )}
                  {/* 活動類型 */}
                  <span className="flex items-center gap-1 text-[var(--color-text-muted)] text-sm">
                    <Tag className="w-3 h-3" />
                    {event.type}
                  </span>
                </div>

                {/* 活動標題 */}
                <h3 className="text-xl font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors mb-2">
                  {event.title}
                </h3>

                {/* 活動描述 */}
                <p className="text-[var(--color-text-muted)] mb-3">
                  {event.description}
                </p>

                {/* 活動日期 */}
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-dark)]">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {event.date} ~ {event.endDate}
                  </span>
                </div>
              </div>

              {/* 查看詳情按鈕 */}
              <Link
                href={`/guide/announcements/${event.id}`}
                className="flex items-center gap-1 text-[var(--color-primary)] hover:text-[var(--color-primary-light)] text-sm whitespace-nowrap"
              >
                查看詳情
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* 空狀態提示 */}
      {events.length === 0 && (
        <div className="card p-12 text-center">
          <Megaphone className="w-16 h-16 text-[var(--color-text-dark)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">暫無活動公告</p>
        </div>
      )}
    </div>
  );
}

