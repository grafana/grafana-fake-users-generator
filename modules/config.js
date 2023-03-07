const fs = require("fs");

function getConfig() {
  try {
    const jsonData = fs.readFileSync("config.json");
    if (!jsonData) {
      console.error("No data in config file");
    }
    const config = JSON.parse(jsonData);
    return {
      grafanaUrl: config.grafanaUrl,
      user: config.user,
      password: config.password,
    };
  } catch (error) {
    console.error("No config found");
  }
}

module.exports = {
  getConfig,
};
