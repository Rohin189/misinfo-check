// backend/middleware/auth.js

import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    // No token, deny access. The frontend will catch this 401 and redirect.
    return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the user's ID to the request object.
    req.userId = decoded.id;
    next(); // Token is valid, proceed to the route handler.
  } catch (err) {
    // Token is invalid or expired, deny access.
    return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
  }
};
