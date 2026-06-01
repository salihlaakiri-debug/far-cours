module.exports = {
  apps: [
    {
      name: "far-app",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
      },
      env_file: ".env.production",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "logs/error.log",
      out_file: "logs/out.log",
      merge_logs: true,
      pid_file: "pids/far-app.pid",
      restart_delay: 3000,
      max_restarts: 10,
      watch: false,
    },
  ],
};
