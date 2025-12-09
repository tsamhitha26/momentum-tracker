const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const Task = require("../models/Task");
const Session = require("../models/Session");

router.post("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { tasks = [], sessions = [] } = req.body;

    // Fetch server tasks + sessions (canonical)
    const serverTasks = await Task.find({ userId }).lean();
    const serverSessions = await Session.find({ userId }).lean();

    // MERGE tasks (client-precedence)
    const tasksMap = {};
    [...serverTasks, ...tasks].forEach(t => {
      tasksMap[t._id || t.id] = { ...t, userId };
    });

    const mergedTasks = Object.values(tasksMap);

    // Save merged tasks
    await Task.deleteMany({ userId });
    const savedTasks = await Task.insertMany(mergedTasks);

    // MERGE sessions (append newer)
    const mergedSessions = [...serverSessions, ...sessions.map(s => ({ ...s, userId }))];

    const savedSessions = await Session.insertMany(
      sessions.map(s => ({ ...s, userId }))
    );

    res.json({
      user: { id: userId },
      tasks: savedTasks,
      sessions: mergedSessions
    });
  } catch (err) {
    console.error("Sync error:", err);
    res.status(500).json({ error: "Sync failed", details: err.message });
  }
});

module.exports = router;
