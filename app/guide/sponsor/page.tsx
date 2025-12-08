import { Heart, Gift, Star, Crown, Zap, Shield } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

// 強制動態渲染
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * 贊助活動頁面
 * 展示贊助方案與獎勵內容
 */

interface SponsorPlan {
  id: string;
  name: string;
  price: number;
  icon: string;
  color: string;
  benefits: string[];
  popular?: boolean;
  link?: string;
}

interface ContentBlock {
  key: string;
  payload: SponsorPlan[];
}

// 圖標映射
const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Shield,
  Star,
  Crown,
  Zap,
};

async function getSponsorData(): Promise<SponsorPlan[]> {
  try {
    const data = await graphqlFetch<{ contentBlock: ContentBlock | null }>(`
      query {
        contentBlock(key: "sponsorPlans") {
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
    console.error("獲取贊助資料失敗:", error);
    return [];
  }
}

export default async function SponsorPage() {
  const sponsorPlans = await getSponsorData();

  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-pink-500/20 flex items-center justify-center">
          <Heart className="w-7 h-7 text-pink-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">贊助活動</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            支持遊戲發展，獲取豐厚回饋
          </p>
        </div>
      </div>

      {/* 贊助說明 */}
      <div className="card p-6 border-pink-500/20">
        <div className="flex items-start gap-4">
          <Gift className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              感謝您的支持！
            </h3>
            <p className="text-[var(--color-text-muted)]">
              您的贊助將幫助我們持續開發更多精彩內容。所有贊助方案均提供豐厚的遊戲內獎勵，
              感謝每一位支持者的信任與愛護。
            </p>
          </div>
        </div>
      </div>

      {/* 贊助方案網格 */}
      {sponsorPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sponsorPlans.map((plan) => {
            const IconComponent = iconMap[plan.icon] || Shield;
            return (
              <div
                key={plan.id}
                className={`card p-6 relative overflow-hidden transition-all hover:scale-[1.02] ${
                  plan.popular ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20" : ""
                }`}
              >
                {/* 熱門標籤 */}
                {plan.popular && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[var(--color-primary)] text-[var(--color-bg-dark)] text-xs font-bold">
                    最受歡迎
                  </div>
                )}

                {/* 方案圖標與名稱 */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${plan.color}20` }}
                  >
                    <IconComponent
                      className="w-7 h-7"
                      style={{ color: plan.color }}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--color-text)]">
                      {plan.name}
                    </h3>
                    <div className="text-2xl font-bold" style={{ color: plan.color }}>
                      NT$ {plan.price}
                    </div>
                  </div>
                </div>

                {/* 獎勵列表 */}
                <ul className="space-y-3 mb-6">
                  {(plan.benefits || []).map((benefit, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-[var(--color-text-muted)]"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: plan.color }}
                      />
                      {benefit}
                    </li>
                  ))}
                </ul>

                {/* 活動資訊提示 */}
                <div
                  className="block w-full py-3 rounded-lg font-semibold text-center"
                  style={{
                    backgroundColor: plan.color,
                    color: "#1a1a2e",
                  }}
                >
                  活動資訊請找客服
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Heart className="w-16 h-16 text-[var(--color-text-dark)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">暫無贊助方案</p>
        </div>
      )}

      {/* 注意事項 */}
      <div className="card p-6 bg-[var(--color-bg-darker)]">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          注意事項
        </h3>
        <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
          <li>• 贊助獎勵將在付款完成後 24 小時內發放至您的遊戲帳號</li>
          <li>• 如有任何問題，請透過客服管道聯繫我們</li>
          <li>• 贊助方案內容可能會不定期調整，請以當下頁面為準</li>
          <li>• 所有贊助均不可退款，請確認後再進行贊助</li>
        </ul>
      </div>
    </div>
  );
}
