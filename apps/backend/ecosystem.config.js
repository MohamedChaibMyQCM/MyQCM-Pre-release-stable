module.exports = {
  apps: [
    {
      name: "app",
      script: "./dist/main.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
