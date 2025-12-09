#!/bin/bash

# 重啟 Kingdoms 專案腳本
# 用法: ./restart.sh

set -e

echo "=== 停止伺服器 ==="
pm2 delete kingdoms || true

echo "=== 清理記憶體 ==="
sync && echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null
echo "已清理系統快取"

echo "=== 刪除 .next 目錄和快取 ==="
rm -rf .next
rm -rf node_modules/.cache
echo "已清理建構快取"

echo "=== 顯示記憶體狀態 ==="
free -h

echo "=== 重新建構專案 ==="
export NODE_OPTIONS="--max-old-space-size=1024"
pnpm build

echo "=== 啟動伺服器 ==="
pm2 start pnpm --name kingdoms --max-memory-restart 800M -- start

echo "=== 完成！==="
pm2 status
free -h
