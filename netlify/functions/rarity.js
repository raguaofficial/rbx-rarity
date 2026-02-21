const axios = require("axios");

exports.handler = async function (event) {
  try {
    const { username } = JSON.parse(event.body);

    const userRes = await axios.post(
      "https://users.roblox.com/v1/usernames/users",
      {
        usernames: [username],
        excludeBannedUsers: false
      }
    );

    if (!userRes.data.data.length) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" })
      };
    }

    const userId = userRes.data.data[0].id;

    const badgeRes = await axios.get(
      `https://badges.roblox.com/v1/users/${userId}/badges?limit=100&sortOrder=Asc`
    );

    const badges = badgeRes.data.data;

    let totalScore = 0;

    for (let badge of badges) {
      if (badge.statistics && badge.statistics.winRatePercentage > 0) {
        totalScore += 100 / badge.statistics.winRatePercentage;
      }
    }

    let rank = "Common 🥉";
    if (totalScore > 20000) rank = "Mythic 💎";
    else if (totalScore > 5000) rank = "Legendary 🏆";
    else if (totalScore > 1000) rank = "Rare 🥈";

    return {
      statusCode: 200,
      body: JSON.stringify({
        username,
        badgeCount: badges.length,
        rarityScore: Math.floor(totalScore),
        rank
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API error" })
    };
  }
};
