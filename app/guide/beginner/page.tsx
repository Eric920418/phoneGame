import { BookOpen, Star, ChevronRight } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";
import Link from "next/link";

// 強制動態渲染
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * 新手攻略頁面
 * 提供新玩家入門指南與基礎教學
 */

interface GuideItem {
  chapter: number;
  title: string;
  desc: string;
  image?: string;
  images?: string[];
  content?: string;
}

interface ContentBlock<T> {
  key: string;
  payload: T;
}

async function getBeginnerGuides(): Promise<GuideItem[]> {
  try {
    const data = await graphqlFetch<{ contentBlock: ContentBlock<GuideItem[]> | null }>(`
      query {
        contentBlock(key: "beginnerGuides") {
          key
          payload
        }
      }
    `, undefined, { skipCache: true });

    if (data.contentBlock?.payload && Array.isArray(data.contentBlock.payload)) {
      return data.contentBlock.payload;
    }
    return [];
  } catch (error) {
    console.error("獲取新手攻略資料失敗:", error);
    return [];
  }
}

export default async function BeginnerPage() {
  const guides = await getBeginnerGuides();

  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-green-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">
            新手攻略
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            入門教學與基礎指南，助你快速上手
          </p>
        </div>
      </div>

      {/* 歡迎卡片 */}
      <div className="card p-6 border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-bold text-[var(--color-text)]">
            歡迎來到破浪三國！
          </h2>
        </div>
        <p className="text-[var(--color-text-muted)]">
          這裡是專為新玩家準備的攻略指南，幫助你快速了解遊戲世界，踏上征戰三國的旅程。
          請按照以下章節循序漸進學習，很快你就能成為一名優秀的三國英雄！
        </p>
      </div>

      {/* 攻略列表 */}
      {guides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide, index) => {
            // 兼容舊資料：優先使用 images 陣列的第一張，否則使用 image
            const coverImage = guide.images?.[0] || guide.image;

            return (
              <Link
                key={index}
                href={`/guide/beginner/${guide.chapter}`}
                className="card overflow-hidden hover:border-green-500/30 transition-all group"
              >
                {/* 攻略圖片 */}
                {coverImage ? (
                  <div className="relative overflow-hidden">
                    <img
                      src={coverImage}
                      alt={guide.title}
                      className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/80 text-white">
                        第 {guide.chapter} 章
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-48 bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-green-500/40" />
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/80 text-white">
                        第 {guide.chapter} 章
                      </span>
                    </div>
                  </div>
                )}

                {/* 攻略內容 */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-[var(--color-text)] mb-2 group-hover:text-green-400 transition-colors flex items-center justify-between">
                    {guide.title}
                    <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
                    {guide.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <BookOpen className="w-16 h-16 text-[var(--color-text-dark)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">暫無新手攻略資料</p>
        </div>
      )}

      {/* 新手小技巧 */}
      <div className="card p-6 bg-[var(--color-bg-darker)]">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          新手小技巧
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--color-text-muted)]">
          <ul className="space-y-2">
            <li>• 每天記得領首都宮殿區的神速單及軍魂符</li>
            <li>• 善用ALT+H自動練功</li>
            <li>• 優先研究一下煉造房可以鍛造那些東西</li>
          </ul>
          <ul className="space-y-2">
            <li>• 打到神鐵、精鋼、流星鐵、百煉鋼，優先留等後期再搞裝備</li>
            <li>• 加入軍團参與國戰拿取額外参與獎勵</li>
            <li>• 時常看官網，會落實日更 別錯過更多資訊</li>
          </ul>
        </div>
      </div>
    </div>
  );
}