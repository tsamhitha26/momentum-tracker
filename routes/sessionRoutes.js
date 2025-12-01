const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Session = require("../models/Session");

/**
 * GET sessions for logged-in user
 */
router.get("/", auth, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id }).sort({ timestamp: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

/**
 * Add one session
 */
router.post("/", auth, async (req, res) => {
  try {
    const created = await Session.create({
      ...req.body,
      userId: req.user.id,
    });

    res.json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to save session" });
  }
});

module.exports = router;
