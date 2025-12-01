// controllers/userController.js
const User = require('../models/User');
const Task = require('../models/Task');
const Session = require('../models/Session');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // keep as you had it

// Helper: generate JWT — now includes username
const generateToken = (userId, username) => {
  return jwt.sign({ id: userId, username }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * REGISTER new user (username + password)
 */
const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "Username and password are required" });

    const normalized = username.trim();

    // Check if user exists
    const existing = await User.findOne({ username: normalized });
    if (existing) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: normalized,
      passwordHash,
    });

    const token = generateToken(user._id, user.username);

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, username: user.username },
      token,
      tasks: [],
      sessions: [],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * LOGIN existing user
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "Username and password are required" });

    const normalized = username.trim();
    const user = await User.findOne({ username: normalized });

    if (!user)
      return res.status(404).json({ error: "User not found" });

    // Check password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ error: "Invalid password" });

    const token = generateToken(user._id, user.username);

    const tasks = await Task.find({ userId: user._id }).sort({ createdAt: -1 });
    const sessions = await Session.find({ userId: user._id }).sort({ timestamp: -1 });

    return res.json({
      message: "Login successful",
      user: { id: user._id, username: user.username },
      token,
      tasks,
      sessions,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET USER PROFILE (requires auth middleware)
 */
const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // added by authMiddleware
    const user = await User.findById(userId).select("-passwordHash");

    if (!user)
      return res.status(404).json({ error: "User not found" });

    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    const sessions = await Session.find({ userId }).sort({ timestamp: -1 });

    return res.json({
      user,
      tasks,
      sessions
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getUserProfile };
