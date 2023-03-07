#!/usr/bin/env node

const {
  assignFixedRolesToUsers,
  assignFixedRolesToTeams,
} = require("./modules/roleAssignments");
const { createTeams, deleteTeams } = require("./modules/teams");
const { createUsers, deleteUsers } = require("./modules/users");

const USERS_NUM = 1000;
const TEAMS_NUM = 100;
const ROLES_PER_USER = 5;
const ROLES_PER_TEAM = 10;
const WORKERS_NUM = 20;

async function main() {
  const args = process.argv.slice(2);

  if (args[0] == "delete") {
    await deleteUsers(WORKERS_NUM);
    await deleteTeams(WORKERS_NUM);
    return;
  }

  await createUsers(USERS_NUM, WORKERS_NUM);
  await createTeams(TEAMS_NUM, WORKERS_NUM);
  await assignFixedRolesToUsers(ROLES_PER_USER, WORKERS_NUM);
  await assignFixedRolesToTeams(ROLES_PER_TEAM, WORKERS_NUM);
}

main();
