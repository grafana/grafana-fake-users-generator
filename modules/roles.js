const rolesToSkip = ["fixed:roles:resetter"];

async function getRoles(client) {
  const result = await client.get("/api/access-control/roles");
  return result;
}

async function getFixedRoles(client) {
  const response = await client.get("/api/access-control/roles");
  let result = response.data;
  result = result.filter((role) => {
    return role.name.startsWith("fixed:") && !rolesToSkip.includes(role.name);
  });
  return result;
}

module.exports = {
  getRoles,
  getFixedRoles,
};
