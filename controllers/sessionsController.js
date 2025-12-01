const User = require('../models/User');

exports.getSessions = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user.focusHistory || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.addSession = async (req, res) => {
  try {
    const username = req.params.username;
    const session = req.body;
    const user = await User.findOneAndUpdate(
      { username },
      { $push: { focusHistory: session } },
      { new: true, upsert: true }
    );
    return res.json(user.focusHistory || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};