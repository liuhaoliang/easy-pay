module.exports = {
  apps: [
    {
      name: "easy-pay",
      script: "./index.js",
      out_file: "/dev/null",
      error_file: "/dev/null",
      max_memory_restart: '600M',
      env: {
        NODE_ENV: "production",
      },
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
  ],
};
