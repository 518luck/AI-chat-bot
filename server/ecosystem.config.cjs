module.exports = {
  apps: [
    {
      // =======================================================
      // 基础配置：适用于所有环境
      // =======================================================
      name: "Chat-Bot-API", // 应用程序名称
      script: "./main.ts", // 你的主启动文件（假设编译后的 JS 文件名为 server.js）

      interpreter: "node",
      // 运行模式：设置为 'max' 以利用所有 CPU 核心进行负载均衡
      instances: "1",

      // 进程管理器会自动重启应用以实现高可用
      autorestart: true,

      // 内存限制：当内存超过 512MB 时重启应用（根据实际情况调整）
      max_memory_restart: "512M",

      // 日志配置：将日志输出到指定文件
      log_file: "logs/combined.log",
      out_file: "logs/out.log", // 应用程序的标准输出
      error_file: "logs/error.log", // 应用程序的错误输出

      // =======================================================
      // 开发环境配置 (npm run dev 或类似命令)
      // =======================================================
      env_development: {
        NODE_ENV: "development",
        // 启用 watch 模式，当文件发生变化时自动重启应用
        // ⚠️ 生产环境必须关闭 watch，以免性能问题
        watch: ["./main.ts"], // 只监控主文件，避免 node_modules 造成大量重启
        ignore_watch: ["node_modules", "logs", "dist"], // 忽略这些目录
        exec_mode: "fork", // 开发时通常使用 fork 模式方便调试
      },

      // =======================================================
      // 生产环境配置 (npm run start 或类似命令)
      // =======================================================
      env_production: {
        NODE_ENV: "production",
        watch: false, // 生产环境必须关闭文件监听
        exec_mode: "fork", // 生产环境使用集群模式以最大化性能
      },
    },
  ],
};
