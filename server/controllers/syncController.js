/**
 * Sync controller
 * POST /api/sync/:username
 * Body: { tasks: [...], sessions: [...] }
 * Behavior:
 * - If user not exist -> create
 * - Merge incoming tasks and sessions with DB idempotently:
 *   * For tasks: incoming items with _id -> update; without _id -> create unless duplicate by title+createdAt
 *   * For sessions: similar by timestamp+duration
 * - Return canonical lists { tasks, sessions }
 */
const User = require('../models/User');
const Task = require('../models/Task');
const Session = require('../models/Session');

const syncForUser = async (req, res, next) => {
  try {
    const username = req.params.username;
    if (!username) return res.status(400).json({ error: 'username required in path' });

    const incomingTasks = Array.isArray(req.body.tasks) ? req.body.tasks : [];
    const incomingSessions = Array.isArray(req.body.sessions) ? req.body.sessions : [];

    const normalized = username.trim();
    let user = await User.findOne({ username: normalized });
    if (!user) user = await User.create({ username: normalized });

    // Merge tasks
    for (const t of incomingTasks) {
      if (t._id) {
        // attempt update by _id if belongs to user
        await Task.findOneAndUpdate(
          { _id: t._id, userId: user._id },
          {
            title: t.title || '',
            completed: !!t.completed,
            createdAt: t.createdAt ? new Date(t.createdAt) : Date.now()
          },
          { upsert: false }
        );
      } else {
        // avoid exact duplicates
        const exists = await Task.findOne({
          userId: user._id,
          title: t.title || '',
          createdAt: t.createdAt ? new Date(t.createdAt) : { $exists: true }
        });
        if (!exists) {
          await Task.create({
            userId: user._id,
            title: t.title || '',
            completed: !!t.completed,
            createdAt: t.createdAt ? new Date(t.createdAt) : Date.now()
          });
        }
      }
    }

    // Merge sessions
    for (const s of incomingSessions) {
      if (s._id) {
        await Session.findOneAndUpdate(
          { _id: s._id, userId: user._id },
          {
            duration: s.duration,
            timestamp: s.timestamp ? new Date(s.timestamp) : Date.now()
          },
          { upsert: false }
        );
      } else {
        const exists = await Session.findOne({
          userId: user._id,
          duration: s.duration,
          timestamp: s.timestamp ? new Date(s.timestamp) : { $exists: true }
        });
        if (!exists) {
          await Session.create({
            userId: user._id,
            duration: s.duration,
            timestamp: s.timestamp ? new Date(s.timestamp) : Date.now()
          });
        }
      }
    }

    // Return canonical lists
    const tasks = await Task.find({ userId: user._id }).sort({ createdAt: -1 });
    const sessions = await Session.find({ userId: user._id }).sort({ timestamp: -1 });

    return res.json({ user, tasks, sessions });
  } catch (err) {
    next(err);
  }
};

module.exports = { syncForUser };