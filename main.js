const fs = require('fs');
const axios = require('axios');
const { uniqueNamesGenerator, adjectives, colors, animals, names } = require('unique-names-generator');

const GRAFANA_URL = 'http://localhost:3000';
const GRAFANA_USER = 'admin';
const GRAFANA_PASSWORD = 'admin';
const NUMBER_OF_USERS = 1;

function getConfig() {
  try {
    const jsonData = fs.readFileSync('config.json');
    if (!jsonData) {
      console.error('No data in config file');
    }
    const config = JSON.parse(jsonData);
    return {
      grafanaUrl: config.grafanaUrl,
      user: config.user,
      password: config.password
    };
  } catch (error) {
    console.error('No config found');
  }
}

function getHTTPClient() {
  const config = getConfig();

  const clientConfig = {
    baseURL: config.grafanaUrl || GRAFANA_URL,
    timeout: 5000,
    auth: {
      username: config.user || GRAFANA_USER,
      password: config.password || GRAFANA_PASSWORD
    },
  };
  const client = axios.create(clientConfig);
  return client;
}

async function createUsers(numberOfUsers) {
  const n = numberOfUsers || NUMBER_OF_USERS;
  console.log('Generating ' + n + ' users...');
  const client = getHTTPClient();

  const customConfig = {
    dictionaries: [names, colors],
    separator: ' ',
    length: 2,
    style: 'capital',
  };

  for (let i = 0; i < n; i++) {
    customConfig.seed = i;
    const name = uniqueNamesGenerator(customConfig);
    const login = name.split(' ').join('.').toLowerCase();
    const email = login + '@example.com';
    console.log(`${name.padEnd(24)}${login.padEnd(24)}${email}`);

    try {
      await client.post('/api/admin/users', {
        name: name,
        email: 'gf_' + email,
        login: 'gf_' + login,
        password: "grafana",
        OrgId: 1,
      });
    } catch (error) {
      if (error.response.statusText == 'Precondition Failed') {
        continue;
      }
      const message = `Error creating user: ${error.response.status} ${error.response.statusText}`
      console.error(message);
      console.error(error.response.data);
      return;
    }
  }
}

async function deleteUsers() {
  console.log('Searching users to delete...');
  const client = getHTTPClient();
  const maxAttempts = 100;
  let i = 0;
  while (i < maxAttempts) {
    i++;
    const response = await client.get('/api/users/search?perpage=100&page=1&query=gf_')
    const res = response.data;
    if (res.totalCount == 0) {
      console.log('No users to delete');
      return;
    } else {
      console.log('Found ' + res.totalCount + ' users to remove');
    }

    for (let i = 0; i < res.users.length; i++) {
      const user = res.users[i];
      await client.delete('/api/admin/users/' + user.id);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.length == 0) {
    console.log(`Usage:
      create [<number_of_users>] - generate and create users in Grafana
      delete                     - remove generated users
    `);
  } else if (args[0] == 'create') {
    const numberOfUsers = args.length > 1 && args[1];
    createUsers(numberOfUsers);
  } else if (args[0] == 'delete') {
    deleteUsers();
  }
}

main();
