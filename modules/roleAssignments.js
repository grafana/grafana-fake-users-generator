const { getHTTPClient } = require("./client");
const { getFixedRoles } = require("./roles");
const { forAllTeams } = require("./teams");
const { forAllUsers } = require("./users");

async function assignFixedRolesToUsers(numberOfRoles = 5, numberOfTasks = 10) {
  console.log("assigning roles to users");
  const client = getHTTPClient();
  const fixedRoles = await getFixedRoles(client);
  const rolesTotal = fixedRoles.length;

  const handler = async (userId, client) => {
    const roleUids = [];
    const roleIdx = Math.max(
      Math.floor(Math.random() * rolesTotal) - numberOfRoles,
      0
    );
    for (let i = 0; i < numberOfRoles; i++) {
      const role = fixedRoles[roleIdx + i];
      roleUids.push(role.uid);
    }
    try {
      // console.log("assigning role ", role.uid);
      await client.put(`/api/access-control/users/${userId}/roles`, {
        roleUids,
      });
    } catch (error) {
      if (error.data) {
        console.warn(error.data);
      } else {
        console.warn(error.response.data);
      }
      console.log(roleUids);
    }
  };

  await forAllUsers(handler, numberOfTasks);
}

async function assignFixedRolesToTeams(numberOfRoles = 5, numberOfTasks = 10) {
  console.log("assigning roles to teams");
  const client = getHTTPClient();
  const fixedRoles = await getFixedRoles(client);
  const rolesTotal = fixedRoles.length;

  const handler = async (teamId, client) => {
    const roleUids = [];
    const roleIdx = Math.max(
      Math.floor(Math.random() * rolesTotal) - numberOfRoles,
      0
    );
    for (let i = 0; i < numberOfRoles; i++) {
      const role = fixedRoles[roleIdx + i];
      roleUids.push(role.uid);
    }
    try {
      await client.put(`/api/access-control/teams/${teamId}/roles`, {
        roleUids,
      });
    } catch (error) {
      if (error.data) {
        console.warn(error.data);
      } else {
        console.warn(error.response.data);
      }
    }
  };

  await forAllTeams(handler, numberOfTasks);
}

module.exports = {
  assignFixedRolesToUsers,
  assignFixedRolesToTeams,
};
