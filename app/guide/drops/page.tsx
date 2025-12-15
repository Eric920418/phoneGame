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
  type: string;
}

interface BossDropData {
  boss: string;
  location: string;
  drops: DropItem[];
}

interface ContentBlock {
  key: string;
  payload: unknown;
}

// 搜尋結果結構
interface SearchResult {
  itemName: string;
  itemType: string;
  boss: string;
  location: string;
}

export default function DropsPage() {
  const [dropItems, setDropItems] = useState<BossDropData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  // 搜尋結果 - 當有搜尋關鍵字時，找出所有匹配的物品或地區
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchQuery.trim()) return [];

    const results: SearchResult[] = [];
    const query = searchQuery.toLowerCase();

    dropItems.forEach((bossData) => {
      // 檢查地區或 BOSS 名稱是否匹配
      const locationMatch = bossData.location.toLowerCase().includes(query);
      const bossMatch = bossData.boss.toLowerCase().includes(query);

      (bossData.drops || []).forEach((drop) => {
        // 物品名稱匹配，或地區/BOSS 匹配
        if (drop.name.toLowerCase().includes(query) || locationMatch || bossMatch) {
          results.push({
            itemName: drop.name,
            itemType: drop.type,
            boss: bossData.boss,
            location: bossData.location,
          });
        }
      });
    });

    return results;
  }, [searchQuery, dropItems]);

  // 是否處於搜尋模式
  const isSearching = searchQuery.trim().length > 0;

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
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
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
            onClick={() => setSearchQuery("")}
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
      )}

      {/* 搜尋結果提示 */}
      {isSearching && (
        <p className="text-sm text-[var(--color-text-muted)] text-center">
          找到 <span className="text-[var(--color-primary)] font-medium">{searchResults.length}</span> 個符合「{searchQuery}」的結果
        </p>
      )}

      {/* 搜尋結果模式 */}
      {isSearching ? (
        searchResults.length > 0 ? (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* 按 boss 分組顯示搜尋結果 */}
            {(() => {
              // 將搜尋結果按 boss 分組
              const groupedResults = searchResults.reduce((acc, result) => {
                if (!acc[result.boss]) {
                  acc[result.boss] = {
                    boss: result.boss,
                    location: result.location,
                    items: []
                  };
                }
                acc[result.boss].items.push(result.itemName);
                return acc;
              }, {} as Record<string, { boss: string; location: string; items: string[] }>);

              return Object.values(groupedResults).map((group, index) => (
                <div
                  key={index}
                  className="card p-6 border border-[var(--color-border)] rounded-lg"
                >
                  <h3 className="text-lg font-bold text-[var(--color-primary)] mb-3">
                    怪物：《{group.boss}》
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {group.items.join('、')}。
                  </p>
                </div>
              ));
            })()}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-muted)]">
              找不到符合「{searchQuery}」的物品
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
                <h3 className="text-lg font-bold text-[var(--color-primary)] mb-3">
                  怪物：《{bossData.boss}》
                </h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {(bossData.drops || []).map(drop => drop.name).join('、')}。
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
