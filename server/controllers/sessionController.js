/**
 * Session controller
 * - GET  /api/sessions/:username  -> list sessions
 * - POST /api/sessions/:username  -> add a session
 */
const User = require('../models/User');
const Session = require('../models/Session');

const getSessionsByUsername = async (req, res, next) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username?.trim() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const sessions = await Session.find({ userId: user._id }).sort({ timestamp: -1 });
    return res.json({ sessions });
  } catch (err) {
    next(err);
  }
};

const createSessionForUser = async (req, res, next) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username?.trim() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { duration, timestamp } = req.body;
    if (typeof duration !== 'number') {
      return res.status(400).json({ error: 'duration (number) required' });
    }
    const session = await Session.create({
      userId: user._id,
      duration,
      timestamp: timestamp ? new Date(timestamp) : Date.now()
    });
    return res.status(201).json({ session });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSessionsByUsername, createSessionForUser };