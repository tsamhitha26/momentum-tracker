const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const Task = require("../models/Task");
const Session = require("../models/Session");

/**
 * Merge local offline data with server
 */
router.post("/", auth, async (req, res) => {
  try {
    const { tasks = [], sessions = [] } = req.body;

    // Replace tasks
    await Task.deleteMany({ userId: req.user.id });
    const savedTasks = await Task.insertMany(
      tasks.map(t => ({ ...t, userId: req.user.id }))
    );

    // Append sessions
    const savedSessions = await Session.insertMany(
      sessions.map(s => ({ ...s, userId: req.user.id }))
    );

    res.json({
      tasks: savedTasks,
      sessions: savedSessions
    });
  } catch (err) {
    res.status(500).json({ error: "Sync failed" });
  }
});

module.exports = router;
