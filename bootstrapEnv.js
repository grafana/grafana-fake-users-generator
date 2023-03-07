#!/usr/bin/env node

const {
  assignFixedRolesToUsers,
  assignFixedRolesToTeams,
} = require("./modules/roleAssignments");
const { createTeams, deleteTeams } = require("./modules/teams");
const { addUsersToTeams } = require("./modules/teamUsers");
const { createUsers, deleteUsers, getUsersCount } = require("./modules/users");

const USERS_NUM = 10000;
const TEAMS_NUM = 100;
const ROLES_PER_USER = 5;
const ROLES_PER_TEAM = 10;
const TEAMS_PER_USER = 10;

const WORKERS_NUM = 20;
const DELETE_WORKERS_NUM = 50;

async function main() {
  const args = process.argv.slice(2);

  if (args[0] == "delete") {
    await deleteUsers(DELETE_WORKERS_NUM);
    await deleteTeams(DELETE_WORKERS_NUM);
    return;
  }

  const usersCount = await getUsersCount();
  if (usersCount > 100) {
    console.warn("Data already populated, skipping...");
    return;
  }

  await createUsers(USERS_NUM, WORKERS_NUM);
  await createTeams(TEAMS_NUM, WORKERS_NUM);
  await assignFixedRolesToUsers(ROLES_PER_USER, WORKERS_NUM);
  await assignFixedRolesToTeams(ROLES_PER_TEAM, WORKERS_NUM);
  await addUsersToTeams(TEAMS_PER_USER, WORKERS_NUM);
}

main();
