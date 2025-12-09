import { BookOpen, ArrowLeft, Calendar } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";
import Link from "next/link";
import { notFound } from "next/navigation";

// 強制動態渲染
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface GuideItem {
  chapter: number;
  title: string;
  desc: string;
  image?: string;
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

interface PageProps {
  params: Promise<{ chapter: string }>;
}

export default async function BeginnerDetailPage({ params }: PageProps) {
  const { chapter } = await params;
  const chapterNum = parseInt(chapter, 10);

  if (isNaN(chapterNum)) {
    notFound();
  }

  const guides = await getBeginnerGuides();
  const guide = guides.find(g => g.chapter === chapterNum);

  if (!guide) {
    notFound();
  }

  // 找出上一章和下一章
  const sortedGuides = [...guides].sort((a, b) => a.chapter - b.chapter);
  const currentIndex = sortedGuides.findIndex(g => g.chapter === chapterNum);
  const prevGuide = currentIndex > 0 ? sortedGuides[currentIndex - 1] : null;
  const nextGuide = currentIndex < sortedGuides.length - 1 ? sortedGuides[currentIndex + 1] : null;

  return (
    <div className="space-y-8">
      {/* 返回按鈕 */}
      <Link
        href="/guide/beginner"
        className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-green-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回攻略列表
      </Link>

      {/* 攻略標題區 */}
      <div className="card overflow-hidden">
        {/* 封面圖片 */}
        {guide.image ? (
          <div className="relative overflow-hidden">
            <img
              src={guide.image}
              alt={guide.title}
              className="w-full h-auto object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-500/80 text-white mb-3">
                第 {guide.chapter} 章
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {guide.title}
              </h1>
            </div>
          </div>
        ) : (
          <div className="relative h-48 bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center">
            <BookOpen className="w-20 h-20 text-green-500/30" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-500/80 text-white mb-3">
                第 {guide.chapter} 章
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)]">
                {guide.title}
              </h1>
            </div>
          </div>
        )}

        {/* 攻略內容 */}
        <div className="p-6 md:p-8">
          {/* 描述 */}
          <p className="text-lg text-[var(--color-text-muted)] mb-6 pb-6 border-b border-[var(--color-border)]">
            {guide.desc}
          </p>

          {/* 詳細內容 */}
          {guide.content ? (
            <div
              className="prose prose-invert max-w-none
                prose-headings:text-[var(--color-text)]
                prose-p:text-[var(--color-text-muted)]
                prose-strong:text-[var(--color-text)]
                prose-ul:text-[var(--color-text-muted)]
                prose-ol:text-[var(--color-text-muted)]
                prose-li:text-[var(--color-text-muted)]
                prose-a:text-green-400 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-lg prose-img:shadow-lg
                prose-blockquote:border-green-500 prose-blockquote:text-[var(--color-text-muted)]
                prose-code:text-green-400 prose-code:bg-[var(--color-bg-darker)] prose-code:px-1 prose-code:rounded
                prose-pre:bg-[var(--color-bg-darker)]"
              dangerouslySetInnerHTML={{ __html: guide.content }}
            />
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-[var(--color-text-dark)] mx-auto mb-4" />
              <p className="text-[var(--color-text-muted)]">詳細攻略內容即將更新...</p>
            </div>
          )}
        </div>
      </div>

      {/* 上一章/下一章導航 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prevGuide ? (
          <Link
            href={`/guide/beginner/${prevGuide.chapter}`}
            className="card p-4 hover:border-green-500/30 transition-all group"
          >
            <span className="text-xs text-[var(--color-text-muted)] mb-1 block">上一章</span>
            <span className="text-[var(--color-text)] group-hover:text-green-400 transition-colors font-medium">
              第 {prevGuide.chapter} 章：{prevGuide.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
        {nextGuide && (
          <Link
            href={`/guide/beginner/${nextGuide.chapter}`}
            className="card p-4 hover:border-green-500/30 transition-all group text-right"
          >
            <span className="text-xs text-[var(--color-text-muted)] mb-1 block">下一章</span>
            <span className="text-[var(--color-text)] group-hover:text-green-400 transition-colors font-medium">
              第 {nextGuide.chapter} 章：{nextGuide.title}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
