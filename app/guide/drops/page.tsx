"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

/**
 * 怪物與掉落物品頁面
 * 提供遊戲內物品掉落資訊查詢
 */

interface DropItem {
  name: string;
}

interface BossDropData {
  boss: string;
  location: string;
  category?: string;
  drops: DropItem[];
}

interface ContentBlock {
  key: string;
  payload: unknown;
}

export default function DropsPage() {
  const [dropItems, setDropItems] = useState<BossDropData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await graphqlFetch<{ contentBlocks: ContentBlock[] }>(`
          query {
            contentBlocks {
              key
              payload
            }
          }
        `);

        const dropItemsBlock = data.contentBlocks.find(block => block.key === "dropItems");
        if (dropItemsBlock && Array.isArray(dropItemsBlock.payload)) {
          setDropItems(dropItemsBlock.payload as BossDropData[]);
        }
      } catch (error) {
        console.error("獲取掉落資料失敗:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // 提取所有唯一的分類
  const categories = useMemo<string[]>(() => {
    const categorySet = new Set<string>();
    dropItems.forEach((item) => {
      if (item.category && item.category.trim()) {
        categorySet.add(item.category.trim());
      }
    });
    return Array.from(categorySet).sort();
  }, [dropItems]);

  // 篩選結果 - 根據搜尋關鍵字和選中的分類
  const filteredBosses = useMemo<BossDropData[]>(() => {
    let results = dropItems;

    // 如果選擇了分類，先按分類篩選
    if (selectedCategory) {
      results = results.filter((bossData) => bossData.category === selectedCategory);
    }

    // 如果有搜尋關鍵字，再按關鍵字篩選
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter((bossData) => {
        // 檢查地區、BOSS 名稱或分類是否匹配
        const locationMatch = bossData.location.toLowerCase().includes(query);
        const bossMatch = bossData.boss.toLowerCase().includes(query);
        const categoryMatch = bossData.category?.toLowerCase().includes(query) || false;

        // 檢查是否有任何掉落物品名稱匹配
        const hasMatchingDrop = (bossData.drops || []).some((drop) =>
          drop.name.toLowerCase().includes(query)
        );

        return locationMatch || bossMatch || categoryMatch || hasMatchingDrop;
      });
    }

    return results;
  }, [searchQuery, selectedCategory, dropItems]);

  // 統計總共找到多少個掉落物
  const totalDropsFound = useMemo(() => {
    return filteredBosses.reduce((sum, boss) => sum + (boss.drops?.length || 0), 0);
  }, [filteredBosses]);

  // 是否處於篩選模式（有搜尋或有選擇分類）
  const isFiltering = searchQuery.trim().length > 0 || selectedCategory !== null;

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] text-center">
          怪物與掉落物品
        </h1>
        <p className="text-[var(--color-text-muted)] text-center">載入中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <h1 className="text-3xl font-bold text-[var(--color-primary)] text-center">
        怪物與掉落物品
      </h1>

      {/* 搜尋框 */}
      {dropItems.length > 0 && (
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-dark)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="輸入關鍵字"
                className="input pl-12 pr-10 w-full py-3 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }}
              className="px-6 py-3 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              重設
            </button>
            <button
              className="px-6 py-3 bg-[var(--color-bg-darker)] border border-[var(--color-primary)] rounded-lg text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
            >
              搜尋
            </button>
          </div>

          {/* 分類按鈕 */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[var(--color-text-muted)] text-sm">分類：</span>
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === null
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-bg-darker)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)]/30"
                }`}
              >
                全部
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === category
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-bg-darker)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)]/30"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 篩選結果提示 */}
      {isFiltering && (
        <p className="text-sm text-[var(--color-text-muted)] text-center">
          {searchQuery && selectedCategory ? (
            <>找到 <span className="text-[var(--color-primary)] font-medium">{filteredBosses.length}</span> 個怪物，共 <span className="text-[var(--color-primary)] font-medium">{totalDropsFound}</span> 個掉落物符合「{searchQuery}」且分類為「{selectedCategory}」的結果</>
          ) : searchQuery ? (
            <>找到 <span className="text-[var(--color-primary)] font-medium">{filteredBosses.length}</span> 個怪物，共 <span className="text-[var(--color-primary)] font-medium">{totalDropsFound}</span> 個掉落物符合「{searchQuery}」的結果</>
          ) : (
            <>「{selectedCategory}」分類共有 <span className="text-[var(--color-primary)] font-medium">{filteredBosses.length}</span> 個怪物，<span className="text-[var(--color-primary)] font-medium">{totalDropsFound}</span> 個掉落物</>
          )}
        </p>
      )}

      {/* 篩選結果模式 */}
      {isFiltering ? (
        filteredBosses.length > 0 ? (
          <div className="space-y-4 max-w-4xl mx-auto">
            {filteredBosses.map((bossData, index) => (
              <div
                key={index}
                className="card p-6 border border-[var(--color-border)] rounded-lg"
              >
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-bold text-[var(--color-primary)]">
                    怪物：《{bossData.boss}》
                  </h3>
                  {bossData.category && (
                    <span className="px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-full text-xs text-[var(--color-primary)]">
                      {bossData.category}
                    </span>
                  )}
                </div>
                <p className="text-[var(--color-text-muted)] leading-relaxed mb-3">
                  {(bossData.drops || []).map(drop => drop.name).join('、')}。
                </p>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  <span className="text-[var(--color-primary)]">地點：</span>{bossData.location}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-muted)]">
              {searchQuery && selectedCategory ? (
                <>找不到符合「{searchQuery}」且分類為「{selectedCategory}」的物品</>
              ) : searchQuery ? (
                <>找不到符合「{searchQuery}」的物品</>
              ) : (
                <>「{selectedCategory}」分類目前沒有資料</>
              )}
            </p>
          </div>
        )
      ) : (
        /* 預設模式 - 簡潔列表 */
        dropItems.length > 0 ? (
          <div className="space-y-4 max-w-4xl mx-auto">
            {dropItems.map((bossData, index) => (
              <div
                key={index}
                className="card p-6 border border-[var(--color-border)] rounded-lg"
              >
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-bold text-[var(--color-primary)]">
                    怪物：《{bossData.boss}》
                  </h3>
                  {bossData.category && (
                    <span className="px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-full text-xs text-[var(--color-primary)]">
                      {bossData.category}
                    </span>
                  )}
                </div>
                <p className="text-[var(--color-text-muted)] leading-relaxed mb-3">
                  {(bossData.drops || []).map(drop => drop.name).join('、')}。
                </p>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  <span className="text-[var(--color-primary)]">地點：</span>{bossData.location}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              暫無掉落資料
            </h3>
            <p className="text-[var(--color-text-muted)]">
              敬請期待，資料更新中...
            </p>
          </div>
        )
      )}
    </div>
  );
}
