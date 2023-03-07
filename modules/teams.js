const {
  uniqueNamesGenerator,
  colors,
  animals,
} = require("unique-names-generator");
const { getHTTPClient } = require("./client");
const { runWorkers } = require("./worker");

const customConfig = {
  dictionaries: [colors, animals],
  separator: " ",
  length: 2,
  style: "lowerCase",
};

async function createTeam(client) {
  const name = uniqueNamesGenerator(customConfig);
  console.log(`${name.padEnd(24)}`);

  try {
    await client.post("/api/teams", {
      name: "gf " + name,
      OrgId: 1,
    });
  } catch (error) {
    if (error.response && error.response.statusText == "Precondition Failed") {
      console.warn("skip creating team");
      return;
    }
    if (error.response) {
      const message = `Error creating team: ${error.response.status} ${error.response.statusText}`;
      console.error(message);
      console.error(error.response.data);
    } else {
      console.error(error);
    }
    return;
  }
}

async function deleteTeam(teamId, client) {
  try {
    await client.delete("/api/teams/" + teamId);
  } catch (error) {
    if (error.data) {
      console.error(error.data);
    } else {
      console.warn("error deleting team");
    }
    return;
  }
}

async function createTeams(numberOfTeams, numberOfTasks = 10) {
  console.log("Generating " + numberOfTeams + " teams...");
  const client = getHTTPClient();

  const tasks = [];
  for (let i = 0; i < numberOfTeams; i++) {
    const task = async () => {
      await createTeam(client);
    };
    tasks.push(task);
  }

  await runWorkers(tasks, numberOfTasks);
}

async function deleteTeams(numberOfTasks = 10) {
  await forTeams(deleteTeam, numberOfTasks);
}

/**
 *
 * @param {(teamId, client) => void} handler
 * @param {number} numberOfTasks
 * @returns
 */
async function forTeams(handler, numberOfTasks = 10) {
  console.log("Searching teams...");
  const client = getHTTPClient();
  const maxAttempts = 100;
  let i = 0;
  while (i < maxAttempts) {
    i++;
    const response = await client.get(
      `/api/teams/search?perpage=${100}&page=1&query=gf`
    );
    const res = response.data;
    if (res.totalCount == 0) {
      console.log("No teams to handle");
      return;
    } else {
      console.log("Found " + res.totalCount + " teams to handle");
    }

    const tasks = [];
    for (let i = 0; i < res.teams.length; i++) {
      const task = async () => {
        const team = res.teams[i];
        await handler(team.id, client);
      };
      tasks.push(task);
    }
    await runWorkers(tasks, numberOfTasks);
  }
}

/**
 *
 * @param {(teamId, client) => void} handler
 * @param {number} numberOfTasks
 * @returns
 */
async function forAllTeams(handler, numberOfTasks = 10) {
  console.log("Searching teams...");
  const client = getHTTPClient();
  let i = 1;
  let pages = 1;
  while (i <= pages) {
    const response = await client.get(
      `/api/teams/search?perpage=${100}&page=${i}&query=gf`
    );
    const res = response.data;
    if (res.totalCount == 0) {
      console.log("No teams to handle");
      return;
    } else {
      console.log("Found " + res.totalCount + " teams to handle");
    }
    if (pages == 1) {
      pages = Math.ceil(res.totalCount / res.perPage);
    }

    const tasks = [];
    for (let i = 0; i < res.teams.length; i++) {
      const task = async () => {
        const team = res.teams[i];
        await handler(team.id, client);
      };
      tasks.push(task);
    }
    await runWorkers(tasks, numberOfTasks);
    i++;
  }
}

module.exports = {
  createTeam,
  deleteTeam,
  createTeams,
  deleteTeams,
  forTeams,
  forAllTeams,
};
