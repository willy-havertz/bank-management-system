const UserPrototype = require('../prototypes/userPrototype');

async function getOverview(req, res) {
  try {
    const userId = req.user.id;
    const data = await UserPrototype.getOverview(userId);
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user overview" });
  }
}

module.exports = { getOverview };
