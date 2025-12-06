"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Plus } from "lucide-react";
import AddCategoryModal from "./AddCategoryModal";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  postCount: number;
}

interface ForumSidebarProps {
  categories: Category[];
  currentCategory?: string;
}

export default function ForumSidebar({ categories, currentCategory }: ForumSidebarProps) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);

  const handleCategoryAdded = () => {
    router.refresh();
  };

  return (
    <>
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">分類</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
            title="新增分類"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">
          <Link
            href="/forum"
            className={`card p-3 flex items-center gap-3 ${!currentCategory ? 'border-[var(--color-primary)]' : ''}`}
          >
            <div className="w-8 h-8 rounded bg-[var(--color-primary)]/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-[var(--color-primary)]" />
            </div>
            <div className="flex-1">
              <span className="text-[var(--color-text)] text-sm font-medium">全部</span>
            </div>
          </Link>

          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/forum?category=${category.slug}`}
              className={`card p-3 flex items-center gap-3 ${currentCategory === category.slug ? 'border-[var(--color-primary)]' : ''}`}
            >
              <div
                className="w-8 h-8 rounded flex items-center justify-center text-sm"
                style={{ backgroundColor: `${category.color}20` }}
              >
                {category.icon || "💬"}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[var(--color-text)] text-sm font-medium block truncate">
                  {category.name}
                </span>
              </div>
              <span className="text-[var(--color-text-dark)] text-xs">
                {category.postCount}
              </span>
            </Link>
          ))}

          {/* 新增分類按鈕 */}
          <button
            onClick={() => setShowAddModal(true)}
            className="card p-3 flex items-center gap-3 w-full text-left hover:border-[var(--color-primary)] transition-colors group"
          >
            <div className="w-8 h-8 rounded bg-[var(--color-bg)] flex items-center justify-center border border-dashed border-[var(--color-border)] group-hover:border-[var(--color-primary)] transition-colors">
              <Plus className="w-4 h-4 text-[var(--color-text-dark)] group-hover:text-[var(--color-primary)]" />
            </div>
            <span className="text-[var(--color-text-muted)] text-sm group-hover:text-[var(--color-primary)]">
              新增分類
            </span>
          </button>
        </div>
      </div>

      <AddCategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleCategoryAdded}
      />
    </>
  );
}
