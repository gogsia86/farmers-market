/**
 * 🌟 Divine PM2 Ecosystem Configuration
 * Farmers Market Platform - Process Management
 * Version: 1.0.0
 *
 * PM2 configuration for running the monitoring daemon as a service
 * with auto-restart, log management, and clustering support.
 */

module.exports = {
  apps: [
    {
      // ========================================================================
      // MONITORING DAEMON
      // ========================================================================
      name: "workflow-monitor-daemon",
      script: "./scripts/pm2-daemon-launcher.js",
      instances: 1, // Single instance for daemon
      exec_mode: "fork",

      // Auto-restart configuration
      autorestart: true,
      watch: false, // Don't watch files in production
      max_memory_restart: "1G",

      // Restart policy
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 5000, // 5 seconds between restarts

      // Environment variables
      env: {
        NODE_ENV: "development",
        BASE_URL: "http://localhost:3000",
        LOG_LEVEL: "info",
      },

      env_production: {
        NODE_ENV: "production",
        BASE_URL: "https://api.farmersmarket.com",
        LOG_LEVEL: "warn",
      },

      env_staging: {
        NODE_ENV: "staging",
        BASE_URL: "https://staging-api.farmersmarket.com",
        LOG_LEVEL: "info",
      },

      // Logging configuration
      error_file: "./logs/pm2/daemon-error.log",
      out_file: "./logs/pm2/daemon-out.log",
      log_file: "./logs/pm2/daemon-combined.log",
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Advanced options
      merge_logs: true,
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 10000,

      // Graceful shutdown
      shutdown_with_message: true,
    },

    // ========================================================================
    // NEXT.JS APPLICATION (Optional - if running with PM2)
    // ========================================================================
    {
      name: "farmers-market-app",
      script: "npm",
      args: "start",
      instances: "max", // Use all available CPU cores
      exec_mode: "cluster",

      autorestart: true,
      watch: false,
      max_memory_restart: "2G",

      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },

      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },

      error_file: "./logs/pm2/app-error.log",
      out_file: "./logs/pm2/app-out.log",
      log_file: "./logs/pm2/app-combined.log",
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      merge_logs: true,
      kill_timeout: 5000,
    },

    // ========================================================================
    // SCHEDULED REPORT GENERATOR (Optional)
    // ========================================================================
    {
      name: "daily-report-generator",
      script: "npx",
      args: "tsx ./scripts/generate-daily-report.ts",
      instances: 1,
      exec_mode: "fork",

      autorestart: false, // Don't auto-restart, run once
      cron_restart: "0 8 * * *", // Run daily at 8 AM

      env: {
        NODE_ENV: "production",
        REPORT_TYPE: "daily",
      },

      error_file: "./logs/pm2/report-error.log",
      out_file: "./logs/pm2/report-out.log",
      time: true,

      merge_logs: true,
    },
  ],

  // ============================================================================
  // PM2 DEPLOY CONFIGURATION (Optional)
  // ============================================================================
  deploy: {
    production: {
      user: "deploy",
      host: ["production-server.com"],
      ref: "origin/main",
      repo: "git@github.com:your-org/farmers-market-platform.git",
      path: "/var/www/farmers-market",
      "post-deploy":
        "npm install && npm run build && pm2 reload ecosystem.config.js --env production",
      env: {
        NODE_ENV: "production",
      },
    },

    staging: {
      user: "deploy",
      host: ["staging-server.com"],
      ref: "origin/develop",
      repo: "git@github.com:your-org/farmers-market-platform.git",
      path: "/var/www/farmers-market-staging",
      "post-deploy":
        "npm install && npm run build && pm2 reload ecosystem.config.js --env staging",
      env: {
        NODE_ENV: "staging",
      },
    },
  },
};

/**
 * ============================================================================
 * USAGE INSTRUCTIONS
 * ============================================================================
 *
 * Start the monitoring daemon:
 *   pm2 start ecosystem.config.js --only workflow-monitor-daemon
 *
 * Start all processes:
 *   pm2 start ecosystem.config.js
 *
 * Start with specific environment:
 *   pm2 start ecosystem.config.js --env production
 *
 * View logs:
 *   pm2 logs workflow-monitor-daemon
 *   pm2 logs workflow-monitor-daemon --lines 100
 *
 * Monitor processes:
 *   pm2 monit
 *   pm2 status
 *
 * Restart daemon:
 *   pm2 restart workflow-monitor-daemon
 *
 * Stop daemon:
 *   pm2 stop workflow-monitor-daemon
 *
 * Delete daemon:
 *   pm2 delete workflow-monitor-daemon
 *
 * Save process list (auto-restart on reboot):
 *   pm2 save
 *   pm2 startup
 *
 * View detailed info:
 *   pm2 describe workflow-monitor-daemon
 *
 * ============================================================================
 * TROUBLESHOOTING
 * ============================================================================
 *
 * If daemon keeps restarting:
 *   pm2 logs workflow-monitor-daemon --err
 *   pm2 describe workflow-monitor-daemon
 *
 * Clear logs:
 *   pm2 flush
 *
 * Reset restart counter:
 *   pm2 reset workflow-monitor-daemon
 *
 * ============================================================================
 */
