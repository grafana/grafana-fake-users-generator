#!/usr/bin/env node
const fs = require("fs");

const {
  generateRolesAndPermissionsSQL,
  generateRemoveSQL,
} = require("./modules/managedPermissions");

const SQL_FILE_NAME = "create_managed_permissions.sql";
const SQL_DELETE_FILE_NAME = "delete_managed_permissions.sql";
const DEFAULT_PERMISSION_NUM = 10;

async function main() {
  const args = process.argv.slice(2);
  const permissionsNum = Number(args[0]) || DEFAULT_PERMISSION_NUM;
  let baseRoleId = args[1];
  if (baseRoleId) {
    baseRoleId = Number(baseRoleId);
  }

  const sql = generateRolesAndPermissionsSQL(permissionsNum, baseRoleId);
  // console.log(sql);

  const deleteSql = generateRemoveSQL(baseRoleId);

  fs.writeFileSync(SQL_FILE_NAME, sql);
  fs.writeFileSync(SQL_DELETE_FILE_NAME, deleteSql);
}

main();
