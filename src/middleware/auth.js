import { verifyAccessToken } from "../utils/token.js";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.userId = decoded.userId;
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Access token error:", err.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
