const axios = require("axios");
const { getConfig } = require("./config");

const GRAFANA_URL = "http://localhost:3000";
const GRAFANA_USER = "admin";
const GRAFANA_PASSWORD = "admin";

function getHTTPClient() {
  const config = getConfig();

  const clientConfig = {
    baseURL: config.grafanaUrl || GRAFANA_URL,
    timeout: 5000,
    auth: {
      username: config.user || GRAFANA_USER,
      password: config.password || GRAFANA_PASSWORD,
    },
  };
  const client = axios.create(clientConfig);
  return client;
}

module.exports = {
  getHTTPClient,
};
