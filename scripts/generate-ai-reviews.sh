#!/bin/bash

# AI 評論生成腳本
# 此腳本通過 cron 定時調用，生成 AI 評論

# 配置
API_URL="http://localhost:3000/api/cron/generate-reviews"
SECRET="kingdoms-secret-key-production-2024"
LOG_FILE="/var/www/phoneGame/logs/ai-reviews.log"

# 確保日誌目錄存在
mkdir -p /var/www/phoneGame/logs

# 記錄時間
echo "$(date '+%Y-%m-%d %H:%M:%S') - 開始生成 AI 評論..." >> "$LOG_FILE"

# 調用 API 生成 1 條評論
RESPONSE=$(curl -s -X GET "${API_URL}?secret=${SECRET}&count=1")

# 記錄結果
echo "$(date '+%Y-%m-%d %H:%M:%S') - 結果: $RESPONSE" >> "$LOG_FILE"
echo "---" >> "$LOG_FILE"
