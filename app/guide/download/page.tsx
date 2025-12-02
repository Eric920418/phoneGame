import { Download, Monitor, Smartphone, Apple, FileDown, HardDrive, Wifi } from "lucide-react";

/**
 * 下載專區頁面
 * 提供遊戲客戶端、補丁等下載連結
 */

// 下載項目配置
const downloads = [
  {
    id: "windows",
    name: "Windows 客戶端",
    icon: Monitor,
    version: "v2.5.3",
    size: "3.2 GB",
    description: "適用於 Windows 10/11 64位元系統",
    downloadUrl: "#",
    color: "#0078d4",
  },
  {
    id: "mac",
    name: "macOS 客戶端",
    icon: Apple,
    version: "v2.5.3",
    size: "3.5 GB",
    description: "適用於 macOS 12.0 或更高版本",
    downloadUrl: "#",
    color: "#555555",
  },
  {
    id: "android",
    name: "Android 版本",
    icon: Smartphone,
    version: "v2.5.3",
    size: "1.8 GB",
    description: "適用於 Android 8.0 或更高版本",
    downloadUrl: "#",
    color: "#3ddc84",
  },
  {
    id: "ios",
    name: "iOS 版本",
    icon: Apple,
    version: "v2.5.3",
    size: "1.9 GB",
    description: "適用於 iOS 14.0 或更高版本",
    downloadUrl: "#",
    color: "#007aff",
  },
];

// 補丁與工具
const patches = [
  {
    id: "patch-2.5.3",
    name: "更新補丁 v2.5.3",
    date: "2024-12-01",
    size: "256 MB",
    description: "修復已知問題，提升遊戲穩定性",
  },
  {
    id: "patch-2.5.2",
    name: "更新補丁 v2.5.2",
    date: "2024-11-15",
    size: "180 MB",
    description: "新增國戰系統優化",
  },
];

export default function DownloadPage() {
  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <Download className="w-7 h-7 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">下載專區</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            遊戲客戶端與更新補丁下載
          </p>
        </div>
      </div>

      {/* 系統需求提示 */}
      <div className="card p-6 border-blue-500/20">
        <div className="flex items-start gap-4">
          <HardDrive className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              系統需求
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--color-text-muted)]">
              <div>
                <strong className="text-[var(--color-text)]">最低配置：</strong>
                <ul className="mt-1 space-y-1">
                  <li>• CPU: Intel i3 或同等級</li>
                  <li>• RAM: 4 GB</li>
                  <li>• 顯卡: GTX 750 或同等級</li>
                  <li>• 硬碟: 10 GB 可用空間</li>
                </ul>
              </div>
              <div>
                <strong className="text-[var(--color-text)]">建議配置：</strong>
                <ul className="mt-1 space-y-1">
                  <li>• CPU: Intel i5 或同等級</li>
                  <li>• RAM: 8 GB</li>
                  <li>• 顯卡: GTX 1060 或同等級</li>
                  <li>• 硬碟: SSD 20 GB 可用空間</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 客戶端下載 */}
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-[var(--color-primary)]" />
          遊戲客戶端
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {downloads.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="card p-6 hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <IconComponent
                      className="w-6 h-6"
                      style={{ color: item.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-[var(--color-text)]">
                        {item.name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-bg-darker)] text-[var(--color-text-muted)]">
                        {item.version}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)] mb-3">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-dark)]">
                        檔案大小: {item.size}
                      </span>
                      <a
                        href={item.downloadUrl}
                        className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                      >
                        <FileDown className="w-4 h-4" />
                        下載
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 更新補丁 */}
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <Wifi className="w-5 h-5 text-[var(--color-primary)]" />
          更新補丁
        </h2>
        <div className="space-y-3">
          {patches.map((patch) => (
            <div
              key={patch.id}
              className="card p-4 flex items-center justify-between hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <FileDown className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-text)]">
                    {patch.name}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {patch.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right text-sm">
                  <div className="text-[var(--color-text-dark)]">{patch.date}</div>
                  <div className="text-[var(--color-text-muted)]">{patch.size}</div>
                </div>
                <a
                  href="#"
                  className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  下載
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

