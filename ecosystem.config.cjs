module.exports = {
  apps: [{
    name: 'kingdoms',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/phoneGame',

    // 内存超过 512MB 自动重启
    max_memory_restart: '512M',

    // 自动重启设置
    autorestart: true,
    watch: false,

    // 如果应用崩溃，等 5 秒后重启
    restart_delay: 5000,

    // 15 秒内重启超过 10 次则停止
    max_restarts: 10,
    min_uptime: '15s',

    // 环境变量
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
