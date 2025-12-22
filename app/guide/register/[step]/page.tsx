import { UserPlus, ArrowLeft, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";
import Link from "next/link";
import { notFound } from "next/navigation";
import ImageGallery from "./ImageGallery";

// 強制動態渲染
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface StepItem {
  step: number;
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

interface DownloadCenterData {
  mainProgram?: { name: string; downloadUrl: string };
  updateFile?: { name: string; downloadUrl: string };
  registrationSteps?: StepItem[];
}

async function getRegistrationSteps(): Promise<StepItem[]> {
  try {
    const data = await graphqlFetch<{ contentBlock: ContentBlock<DownloadCenterData> | null }>(`
      query {
        contentBlock(key: "downloadCenter") {
          key
          payload
        }
      }
    `, undefined, { skipCache: true });

    if (data.contentBlock?.payload?.registrationSteps && Array.isArray(data.contentBlock.payload.registrationSteps)) {
      return data.contentBlock.payload.registrationSteps;
    }
    return [];
  } catch (error) {
    console.error("獲取註冊步驟資料失敗:", error);
    return [];
  }
}

interface PageProps {
  params: Promise<{ step: string }>;
}

export default async function RegisterDetailPage({ params }: PageProps) {
  const { step } = await params;
  const stepNum = parseInt(step, 10);

  if (isNaN(stepNum)) {
    notFound();
  }

  const steps = await getRegistrationSteps();
  const currentStep = steps.find(s => s.step === stepNum);

  if (!currentStep) {
    notFound();
  }

  // 找出上一步和下一步
  const sortedSteps = [...steps].sort((a, b) => a.step - b.step);
  const currentIndex = sortedSteps.findIndex(s => s.step === stepNum);
  const prevStep = currentIndex > 0 ? sortedSteps[currentIndex - 1] : null;
  const nextStep = currentIndex < sortedSteps.length - 1 ? sortedSteps[currentIndex + 1] : null;

  // 兼容舊資料：合併 image 和 images
  const allImages = currentStep.images?.length ? currentStep.images : (currentStep.image ? [currentStep.image] : []);

  return (
    <div className="space-y-8">
      {/* 返回按鈕 */}
      <Link
        href="/guide/download"
        className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回下載專區
      </Link>

      {/* 步驟標題區 */}
      <div className="card overflow-hidden">
        {/* 標題區 */}
        <div className="p-6 border-b border-[var(--color-border)]">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-cyan-500/20 text-cyan-400 mb-3">
            第 {currentStep.step} 步
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)]">
            {currentStep.title}
          </h1>
        </div>

        {/* 圖片展示區 */}
        {allImages.length > 0 ? (
          <ImageGallery images={allImages} title={currentStep.title} />
        ) : (
          <div className="relative h-48 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center">
            <UserPlus className="w-20 h-20 text-cyan-500/30" />
          </div>
        )}

        {/* 步驟內容 */}
        <div className="p-6 md:p-8">
          {/* 描述 */}
          <p className="text-lg text-[var(--color-text-muted)] mb-6 pb-6 border-b border-[var(--color-border)]">
            {currentStep.desc}
          </p>

          {/* 詳細內容 */}
          {currentStep.content ? (
            <div
              className="prose prose-invert max-w-none
                prose-headings:text-[var(--color-text)]
                prose-p:text-[var(--color-text-muted)]
                prose-strong:text-[var(--color-text)]
                prose-ul:text-[var(--color-text-muted)]
                prose-ol:text-[var(--color-text-muted)]
                prose-li:text-[var(--color-text-muted)]
                prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-lg prose-img:shadow-lg
                prose-blockquote:border-cyan-500 prose-blockquote:text-[var(--color-text-muted)]
                prose-code:text-cyan-400 prose-code:bg-[var(--color-bg-darker)] prose-code:px-1 prose-code:rounded
                prose-pre:bg-[var(--color-bg-darker)]"
              dangerouslySetInnerHTML={{ __html: currentStep.content }}
            />
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-[var(--color-text-dark)] mx-auto mb-4" />
              <p className="text-[var(--color-text-muted)]">詳細說明內容即將更新...</p>
            </div>
          )}
        </div>
      </div>

      {/* 上一步/下一步導航 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prevStep ? (
          <Link
            href={`/guide/register/${prevStep.step}`}
            className="card p-4 hover:border-cyan-500/30 transition-all group"
          >
            <span className="text-xs text-[var(--color-text-muted)] mb-1 block">上一步</span>
            <span className="text-[var(--color-text)] group-hover:text-cyan-400 transition-colors font-medium">
              第 {prevStep.step} 步：{prevStep.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
        {nextStep && (
          <Link
            href={`/guide/register/${nextStep.step}`}
            className="card p-4 hover:border-cyan-500/30 transition-all group text-right"
          >
            <span className="text-xs text-[var(--color-text-muted)] mb-1 block">下一步</span>
            <span className="text-[var(--color-text)] group-hover:text-cyan-400 transition-colors font-medium">
              第 {nextStep.step} 步：{nextStep.title}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
