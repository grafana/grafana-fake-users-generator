const { getTeams } = require("./teams");
const { forAllUsers } = require("./users");

async function addUsersToTeams(teamsPerUser = 1, numberOfTasks = 10) {
  console.log("adding users to teams");
  const teams = await getTeams();

  const userHandler = async (userId, client) => {
    const userTeams = [];
    const teamIdx = Math.max(
      Math.floor(Math.random() * (teams.length - 1)) - teamsPerUser,
      0
    );
    for (let i = 0; i < teamsPerUser; i++) {
      userTeams.push(teams[teamIdx + i]);
    }

    for (let i = 0; i < userTeams.length; i++) {
      const teamId = userTeams[i];
      try {
        await client.post(`/api/teams/${teamId}/members/`, {
          userId,
        });
      } catch (error) {
        if (error.data) {
          console.warn(error.data);
        } else {
          console.warn(error.response.data);
        }
      }
    }
  };

  await forAllUsers(userHandler, numberOfTasks);
}

module.exports = {
  addUsersToTeams,
};
