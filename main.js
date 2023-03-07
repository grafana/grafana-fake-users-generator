#!/usr/bin/env node

const { createUsers, deleteUsers } = require("./modules/users");

const DEFAULT_NUMBER_OF_USERS = 1;

function main() {
  const args = process.argv.slice(2);
  if (args.length == 0) {
    console.log(`Usage:
      create [<number_of_users>] - generate and create users in Grafana
      delete                     - remove generated users
    `);
  } else if (args[0] == "create") {
    const numberOfUsers =
      (args.length > 1 && args[1]) || DEFAULT_NUMBER_OF_USERS;
    const numberOfTasks = args[2] || 10;
    createUsers(numberOfUsers, numberOfTasks);
  } else if (args[0] == "delete") {
    const numberOfTasks = args[1] || 10;
    deleteUsers(numberOfTasks);
  }
}

main();
