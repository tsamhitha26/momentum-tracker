// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // will throw if invalid/expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded should now contain { id, username } per our token creation
    req.user = { id: decoded.id, username: decoded.username };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
