module.exports = {
    apps : [{
      name        : "rtve-app-pf-fosas",
      cwd         : '/aplicaciones/rtve-app-pf-fosas',
      script      : 'dist/server.js',
      instances   : '1',
      exec_mode   : 'cluster',
      node_args   : '--optimize_for_size --max_old_space_size=1024 --gc_interval=100 --use_idle_notification',
      error_file  : '/logs/aplicaciones/rtve-app-pf-fosas/pm2.error.log',
      out_file    : '/logs/aplicaciones/rtve-app-pf-fosas/pm2.out.log',
      env: {
        NODE_ENV: 'development'
      },
      env_production : {
        NODE_ENV: 'production'
      }
    }],

  };