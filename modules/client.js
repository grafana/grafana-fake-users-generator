const axios = require("axios");
const { getConfig } = require("./config");

const GRAFANA_URL = "http://localhost:3000";
const GRAFANA_USER = "admin";
const GRAFANA_PASSWORD = "admin";

let _client = null;

function getHTTPClient() {
  if (_client) {
    return _client;
  }

  const config = getConfig();

  const clientConfig = {
    baseURL: process.env.GRAFANA_URL || config.grafanaUrl || GRAFANA_URL,
    timeout: 5000,
    auth: {
      username: config.user || GRAFANA_USER,
      password: config.password || GRAFANA_PASSWORD,
    },
  };
  const client = axios.create(clientConfig);
  _client = client;
  return client;
}

module.exports = {
  getHTTPClient,
};
