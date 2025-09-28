module.exports = {
  apps: [
    {
      name: "BARAB",
      cwd: "./",
      script: "./dist/server.js",
      watch: false,
      env_production: {
        NODE_ENV: "production",
        BASE_URL: "http://156.67.214.155:3009",
      },
      env_development: {
        NODE_ENV: "development",
        BASE_URL: "http://localhost:3009",
      },
      instances: 1,
      exec_mode: "cluster",
    },
  ],
};
