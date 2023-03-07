const {
  uniqueNamesGenerator,
  colors,
  names,
} = require("unique-names-generator");
const { getHTTPClient } = require("./client");
const { runWorkers } = require("./worker");

const customConfig = {
  dictionaries: [names, colors],
  separator: " ",
  length: 2,
  style: "capital",
};

async function createUser(client, idx = 1, debug = false) {
  const name = uniqueNamesGenerator(customConfig);
  const login = name.split(" ").join(".").toLowerCase() + idx;
  const email = login + "@example.com";

  if (debug) {
    console.log(`${name.padEnd(24)}${login.padEnd(24)}${email}`);
  }

  try {
    await client.post("/api/admin/users", {
      name: name,
      email: "gf_" + email,
      login: "gf_" + login,
      password: "grafana",
      OrgId: 1,
    });
  } catch (error) {
    if (error.response && error.response.statusText == "Precondition Failed") {
      console.warn("skip creating user");
      return;
    }
    if (error.response) {
      const message = `Error creating user: ${error.response.status} ${error.response.statusText}`;
      console.error(message);
      console.error(error.response.data);
    } else {
      console.error(error);
    }
    return;
  }
}

async function deleteUser(userId, client) {
  try {
    await client.delete("/api/admin/users/" + userId);
  } catch (error) {
    if (error.data) {
      console.error(error.data);
    }
    return;
  }
}

async function createUsers(numberOfUsers, numberOfTasks = 10) {
  console.log("Generating " + numberOfUsers + " users...");
  const client = getHTTPClient();

  const tasks = [];
  for (let i = 0; i < numberOfUsers; i++) {
    const task = async () => {
      await createUser(client, i + 1);
    };
    tasks.push(task);
  }

  await runWorkers(tasks, numberOfTasks);
}

async function deleteUsers(numberOfTasks = 10) {
  await forUsers(deleteUser, numberOfTasks);
}

/**
 *
 * @param {(userId, client) => void} handler
 * @param {number} numberOfTasks
 * @returns
 */
async function forUsers(handler, numberOfTasks = 10) {
  console.log("Searching users...");
  const client = getHTTPClient();
  const maxAttempts = 100;
  let i = 0;
  while (i < maxAttempts) {
    i++;
    const response = await client.get(
      `/api/users/search?perpage=${100}&page=1&query=gf_`
    );
    const res = response.data;
    if (res.totalCount == 0) {
      console.log("No users to handle");
      return;
    } else {
      console.log("Found " + res.totalCount + " users to handle");
    }

    const tasks = [];
    for (let i = 0; i < res.users.length; i++) {
      const task = async () => {
        const user = res.users[i];
        await handler(user.id, client);
      };
      tasks.push(task);
    }
    await runWorkers(tasks, numberOfTasks);
  }
}

/**
 *
 * @param {(userId, client) => void} handler
 * @param {number} numberOfTasks
 * @returns
 */
async function forAllUsers(handler, numberOfTasks = 10) {
  console.log("Searching users...");
  const client = getHTTPClient();
  let i = 1;
  let pages = 1;
  while (i <= pages) {
    const response = await client.get(
      `/api/users/search?perpage=${100}&page=${i}&query=gf_`
    );
    const res = response.data;
    if (res.totalCount == 0) {
      console.log("No users to handle");
      return;
    } else {
      console.log("Found " + res.totalCount + " users to handle");
    }
    if (pages == 1) {
      pages = Math.ceil(res.totalCount / res.perPage);
    }

    const tasks = [];
    for (let i = 0; i < res.users.length; i++) {
      const task = async () => {
        const user = res.users[i];
        await handler(user.id, client);
      };
      tasks.push(task);
    }
    await runWorkers(tasks, numberOfTasks);
    i++;
  }
}

module.exports = {
  createUser,
  deleteUser,
  createUsers,
  deleteUsers,
  forUsers,
  forAllUsers,
};
