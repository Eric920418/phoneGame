"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, MapPin, Star, Skull, X, ChevronDown, ChevronUp } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

/**
 * 掉落查詢頁面
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

// 預設顯示的物品數量
const DEFAULT_VISIBLE_ITEMS = 3;

export default function DropsPage() {
  const [dropItems, setDropItems] = useState<BossDropData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBosses, setExpandedBosses] = useState<Set<number>>(new Set());

  // 切換展開/收合狀態
  const toggleBossExpand = (index: number) => {
    setExpandedBosses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

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
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Search className="w-7 h-7 text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)]">掉落查詢</h1>
            <p className="text-[var(--color-text-muted)] mt-1">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center">
          <Search className="w-7 h-7 text-orange-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">掉落查詢</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            查詢各 BOSS 的掉落物品資訊
          </p>
        </div>
      </div>

      {/* 搜尋框 */}
      {dropItems.length > 0 && (
        <div className="card p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-dark)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋物品、地區或 BOSS 名稱"
              className="input pl-12 pr-10 w-full text-lg py-3"
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
          {isSearching && (
            <p className="text-sm text-[var(--color-text-muted)] mt-2">
              找到 <span className="text-[var(--color-primary)] font-medium">{searchResults.length}</span> 個符合「{searchQuery}」的物品
            </p>
          )}
        </div>
      )}

      {/* 搜尋結果模式 */}
      {isSearching ? (
        searchResults.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">搜尋結果</h2>
            <div className="space-y-3">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="card p-4 hover:border-orange-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {/* 物品資訊 */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Star className="w-5 h-5 text-[#f39c12] shrink-0" />
                      <span className="font-bold text-[var(--color-text)] text-lg truncate">
                        {result.itemName}
                      </span>
                      {result.itemType && (
                        <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] shrink-0">
                          {result.itemType}
                        </span>
                      )}
                    </div>

                    {/* BOSS 和地點資訊 */}
                    <div className="flex items-center gap-2 text-sm shrink-0 whitespace-nowrap">
                      <Skull className="w-4 h-4 text-[#f39c12]" />
                      <span className="text-[var(--color-text)] font-medium">{result.boss}</span>
                      <span className="text-[var(--color-text-dark)] mx-1">|</span>
                      <MapPin className="w-3 h-3 text-[var(--color-text-muted)]" />
                      <span className="text-[var(--color-text-muted)] text-xs">{result.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--color-bg-darker)] flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-[var(--color-text-muted)]" />
            </div>
            <p className="text-[var(--color-text-muted)]">
              找不到符合「{searchQuery}」的物品
            </p>
          </div>
        )
      ) : (
        /* 預設模式 - 以 BOSS 為主的列表 */
        dropItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dropItems.map((bossData, index) => (
              <div
                key={index}
                className="card p-6 hover:border-orange-500/30 transition-all"
              >
                {/* BOSS 資訊 */}
                <div className="flex items-center gap-4 mb-5 pb-4 border-b border-[var(--color-border)]">
                  <div className="w-12 h-12 rounded-xl bg-[#f39c12]/10 flex items-center justify-center">
                    <Skull className="w-6 h-6 text-[#f39c12]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--color-text)]">
                      {bossData.boss}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
                      <MapPin className="w-4 h-4" />
                      {bossData.location}
                    </div>
                  </div>
                </div>

                {/* 掉落物品列表 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-[var(--color-text-muted)]">
                      掉落物品 ({(bossData.drops || []).length})
                    </h4>
                  </div>
                  {(bossData.drops || []).length > 0 ? (
                    <>
                      <div className="space-y-2">
                        {(expandedBosses.has(index)
                          ? bossData.drops
                          : bossData.drops.slice(0, DEFAULT_VISIBLE_ITEMS)
                        ).map((drop, dIndex) => (
                          <div
                            key={dIndex}
                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--color-bg-darker)] hover:bg-[var(--color-bg-card-hover)] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Star className="w-4 h-4 text-[#f39c12]" />
                              <span className="text-[var(--color-text)] font-medium">
                                {drop.name}
                              </span>
                            </div>
                            {drop.type && (
                              <span className="text-xs px-2 py-1 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                {drop.type}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      {/* 展開/收合按鈕 */}
                      {bossData.drops.length > DEFAULT_VISIBLE_ITEMS && (
                        <button
                          onClick={() => toggleBossExpand(index)}
                          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors rounded-lg hover:bg-[var(--color-bg-darker)]"
                        >
                          {expandedBosses.has(index) ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              收合
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              展開全部 ({bossData.drops.length - DEFAULT_VISIBLE_ITEMS} 項)
                            </>
                          )}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-[var(--color-text-muted)] py-2">
                      暫無掉落物品資料
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#f39c12]/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-[#f39c12]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              暫無掉落資料
            </h3>
            <p className="text-[var(--color-text-muted)]">
              敬請期待，資料更新中...
            </p>
          </div>
        )
      )}

      {/* 說明 */}
      {dropItems.length > 0 && !isSearching && (
        <div className="card p-6 bg-[var(--color-bg-darker)]">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            查詢說明
          </h3>
          <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
            <li>• 在上方搜尋框輸入物品關鍵字，即可快速查詢掉落來源</li>
            <li>• 掉落資訊可能因版本更新而調整</li>
            <li>• 稀有物品通常需要較長時間刷取，請耐心嘗試</li>
          </ul>
        </div>
      )}
    </div>
  );
}
