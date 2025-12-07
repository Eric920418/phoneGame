#!/bin/bash

# 重啟 Kingdoms 專案腳本
# 用法: ./restart.sh

set -e

echo "=== 停止伺服器 ==="
pm2 delete kingdoms || true

echo "=== 刪除 .next 目錄 ==="
rm -rf .next

echo "=== 重新建構專案 ==="
pnpm build

echo "=== 啟動伺服器 ==="
pm2 start pnpm --name kingdoms -- start

echo "=== 完成！==="
pm2 status
