/**
 * Task controller
 * - GET  /api/tasks/:username      -> list tasks for user
 * - POST /api/tasks/:username      -> create single task OR bulk replace if body is array
 * - PUT  /api/tasks/:id            -> update by id
 * - DELETE /api/tasks/:id          -> delete by id
 */
const User = require('../models/User');
const Task = require('../models/Task');

const getTasksByUsername = async (req, res, next) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username?.trim() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const tasks = await Task.find({ userId: user._id }).sort({ createdAt: -1 });
    return res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

const createOrReplaceTasks = async (req, res, next) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username?.trim() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // If client sends an array -> replace (bulk sync)
    if (Array.isArray(req.body)) {
      // Remove all user's tasks and insert incoming mapped tasks
      await Task.deleteMany({ userId: user._id });
      const docs = req.body.map(t => ({
        userId: user._id,
        title: t.title || '',
        completed: !!t.completed,
        createdAt: t.createdAt ? new Date(t.createdAt) : Date.now()
      }));
      const created = await Task.insertMany(docs);
      return res.status(201).json({ tasks: created });
    }

    // Otherwise create a single task
    const { title, completed } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    const task = await Task.create({ userId: user._id, title: title.trim(), completed: !!completed });
    return res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const task = await Task.findOneAndUpdate({ _id: id }, updates, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    return res.json({ task });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const id = req.params.id;
    const task = await Task.findOneAndDelete({ _id: id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    return res.json({ message: 'deleted', taskId: id });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasksByUsername, createOrReplaceTasks, updateTask, deleteTask };