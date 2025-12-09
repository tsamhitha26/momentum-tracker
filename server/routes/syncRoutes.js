const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const Task = require("../models/Task");
const Session = require("../models/Session");

/**
 * POST /api/sync
 * Requires authentication
 * Body: { tasks: [...], sessions: [...] }
 *
 * Behavior:
 * - Merge client → server (client takes priority)
 * - Return canonical lists
 */
router.post("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const incomingTasks = req.body.tasks || [];
    const incomingSessions = req.body.sessions || [];

    // Fetch existing server data
    const serverTasks = await Task.find({ userId }).lean();
    const serverSessions = await Session.find({ userId }).lean();

    // --- MERGE TASKS ---
    const taskMap = {};
    [...serverTasks, ...incomingTasks].forEach(t => {
      const key = t._id?.toString() || t.id;
      if (!key) return;

      taskMap[key] = {
        title: t.title || "",
        completed: !!t.completed,
        createdAt: t.createdAt ? new Date(t.createdAt) : Date.now(),
        userId
      };
    });

    const mergedTasks = Object.values(taskMap);

    // Save tasks
    await Task.deleteMany({ userId });
    const savedTasks = await Task.insertMany(mergedTasks);

    // --- MERGE SESSIONS ---
    const sessionList = [
      ...serverSessions,
      ...incomingSessions.map(s => ({
        duration: s.duration,
        timestamp: s.timestamp ? new Date(s.timestamp) : Date.now(),
        userId
      }))
    ];

    // Save only new sessions (don’t duplicate)
    const savedSessions = await Session.insertMany(
      incomingSessions.map(s => ({
        duration: s.duration,
        timestamp: s.timestamp ? new Date(s.timestamp) : Date.now(),
        userId
      }))
    );

    res.json({
      user: { id: userId },
      tasks: savedTasks,
      sessions: sessionList
    });

  } catch (err) {
    console.error("SYNC ERROR:", err);
    res.status(500).json({ error: "Sync failed", details: err.message });
  }
});

module.exports = router;
