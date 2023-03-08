const ROLE_ID_BASE = 10001;

const managedRoles = [
  "managed:builtins:viewer:permissions",
  "managed:builtins:editor:permissions",
  "managed:builtins:admin:permissions",
];

const basicRoles = ["Viewer", "Editor", "Admin"];

function formatRole(roleId, name, uid) {
  return `(${roleId},'${name}','',0,1,'${uid}','2023-01-01 10:00:00','2023-01-01 10:00:00')`;
}

function formatPermission(roleId, scopeUid) {
  return `(${roleId},'dashboards:read','dashboards:uid:${scopeUid}','2023-01-01 10:00:00','2023-01-01 10:00:00')`;
}

function formatAssignment(role, roleId) {
  return `('${role}',${roleId},'2023-01-01 10:00:00','2023-01-01 10:00:00',1)`;
}

function generateManagedRolesSQL(baseRoleId = ROLE_ID_BASE) {
  let rolesInsertQuery = `INSERT INTO
    role (id, name, description, version, org_id, uid, created, updated)
VALUES
`;
  managedRoles.forEach((name, idx) => {
    const roleId = baseRoleId + idx;
    const roleUid = `${roleId}`.padStart(8, "0");
    const roleStr = formatRole(roleId, name, roleUid);
    rolesInsertQuery += `\t${roleStr},\n`;
  });

  rolesInsertQuery = rolesInsertQuery.substring(0, rolesInsertQuery.length - 2);
  rolesInsertQuery += ";";

  return rolesInsertQuery;
}

function generateManagedPermissionsSQL(n, baseRoleId = ROLE_ID_BASE) {
  let permissionInsertQuery = `INSERT INTO
    permission (role_id, action, scope, created, updated)
VALUES
`;

  for (let rIdx = 0; rIdx < managedRoles.length; rIdx++) {
    const roleId = baseRoleId + rIdx;
    for (let i = 0; i < n; i++) {
      const permissionUid = `${i}`.padStart(8, "0");
      const permissionStr = formatPermission(roleId, permissionUid);
      permissionInsertQuery += `\t${permissionStr},\n`;
    }
  }

  permissionInsertQuery = permissionInsertQuery.substring(
    0,
    permissionInsertQuery.length - 2
  );
  permissionInsertQuery += ";";

  return permissionInsertQuery;
}

function generateAssignmentSQL(baseRoleId = ROLE_ID_BASE) {
  let assignmentsInsertQuery = `INSERT INTO
  builtin_role (role, role_id, created, updated, org_id)
VALUES
`;
  for (let i = 0; i < managedRoles.length; i++) {
    const roleId = baseRoleId + i;
    const assignment = formatAssignment(basicRoles[i], roleId);
    assignmentsInsertQuery += `\t${assignment},\n`;
  }

  assignmentsInsertQuery = assignmentsInsertQuery.substring(
    0,
    assignmentsInsertQuery.length - 2
  );
  assignmentsInsertQuery += ";";

  return assignmentsInsertQuery;
}

function generateRolesAndPermissionsSQL(n, baseRoleId = ROLE_ID_BASE) {
  let sql = "";
  sql += generateManagedRolesSQL(baseRoleId);
  sql += "\n\n";
  sql += generateManagedPermissionsSQL(n, baseRoleId);
  sql += "\n\n";
  sql += generateAssignmentSQL(baseRoleId);
  sql += "\n";
  return sql;
}

function generateRemoveSQL(baseRoleId = ROLE_ID_BASE) {
  let permissionDeleteQuery = `DELETE FROM permission WHERE role_id IN (`;
  let rolesDeleteQuery = `DELETE FROM role WHERE id IN (`;
  let assignmentsDeleteQuery = `DELETE FROM builtin_role WHERE role_id IN (`;

  for (let rIdx = 0; rIdx < managedRoles.length; rIdx++) {
    const roleId = baseRoleId + rIdx;
    permissionDeleteQuery += `${roleId},`;
    rolesDeleteQuery += `${roleId},`;
    assignmentsDeleteQuery += `${roleId},`;
  }

  permissionDeleteQuery = permissionDeleteQuery.substring(
    0,
    permissionDeleteQuery.length - 1
  );
  permissionDeleteQuery += ");\n\n";

  rolesDeleteQuery = rolesDeleteQuery.substring(0, rolesDeleteQuery.length - 1);
  rolesDeleteQuery += ");\n\n";

  assignmentsDeleteQuery = assignmentsDeleteQuery.substring(
    0,
    assignmentsDeleteQuery.length - 1
  );
  assignmentsDeleteQuery += ");\n";

  return permissionDeleteQuery + rolesDeleteQuery + assignmentsDeleteQuery;
}

module.exports = {
  generateRolesAndPermissionsSQL,
  generateRemoveSQL,
};
