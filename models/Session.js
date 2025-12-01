const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  duration: Number,
  timestamp: { type: Date, default: Date.now },
  sessionsCompleted: Number
});

module.exports = mongoose.model("Session", SessionSchema);
