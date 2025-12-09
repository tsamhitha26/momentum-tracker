const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Task = require("../models/Task");

/**
 * GET all tasks for logged-in user
 */
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

/**
 * Replace all tasks (bulk save)
 */
router.post("/", auth, async (req, res) => {
  try {
    const incoming = req.body;

    // Remove old tasks
    await Task.deleteMany({ userId: req.user.id });

    // Insert new ones
    const created = await Task.insertMany(
      incoming.map((t) => ({ ...t, userId: req.user.id }))
    );

    res.json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to save tasks" });
  }
});

/**
 * Update one task
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

/**
 * Delete one task
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    await Task.deleteOne({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

module.exports = router;
