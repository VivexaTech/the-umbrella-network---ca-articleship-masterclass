/**
 * PM2 Process Management Configuration for Hostinger VPS & Cloud
 * 
 * Usage on Hostinger VPS:
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [
    {
      name: 'umbrella-articleship-masterclass',
      script: 'dist/server.cjs',
      instances: 'max', // Utilizes all available CPU cores on your Hostinger plan
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        HOSTINGER_PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        HOSTINGER_PORT: 3000,
      },
    },
  ],
};
