module.exports = {
  apps: [
    {
      name: 'saciform-backend',
      script: './dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-vps-host.com',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/sacifor-backend.git',
      path: '/var/www/sacifor-backend',
      'pre-deploy-local': '',
      'post-deploy':
        'pnpm install --prod --frozen-lockfile && pnpm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      ssh_options: 'ForwardAgent=yes',
    },
  },
};
