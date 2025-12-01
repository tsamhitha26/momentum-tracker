const User = require('../models/User');

exports.getTasks = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user.tasks || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.replaceTasks = async (req, res) => {
  try {
    const username = req.params.username;
    const tasks = Array.isArray(req.body) ? req.body : [];
    const user = await User.findOneAndUpdate(
      { username },
      { $set: { tasks } },
      { new: true, upsert: true }
    );
    return res.json(user.tasks || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { username, taskId } = req.params;
    const user = await User.findOneAndUpdate(
      { username },
      { $pull: { tasks: { id: taskId } } },
      { new: true }
    );
    return res.json(user.tasks || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};