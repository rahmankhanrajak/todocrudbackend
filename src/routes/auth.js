import express from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token.js";

const router = express.Router();
const prisma = new PrismaClient();


router.get("/test", (req, res) => {
  res.send("Auth routes working");
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    res.status(201).json({
      message: "User created",
      userId: user.id,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

   const session= await prisma.refreshSession.create({
      data: {
        refreshToken,
        userId: user.id,
        userAgent: req.headers["user-agent"],
      },
    });
console.log("Refresh session stored:", session.id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// router.post("/refresh", async (req, res) => {
//   try {
//     const refreshToken = req.cookies.refreshToken;
//     if (!refreshToken) return res.sendStatus(401);

//     const decoded = verifyRefreshToken(refreshToken);

//     const session = await prisma.refreshSession.findFirst({
//       where: {
//         refreshToken,
//         revokedAt: null,
//         userId: decoded.userId,
//       },
//       include: { user: true },
//     });

//     if (!session) return res.sendStatus(403);

//     await prisma.refreshSession.update({
//       where: { id: session.id },
//       data: { revokedAt: new Date() },
//     });

//     const newRefreshToken = generateRefreshToken({
//       userId: session.user.id,
//     });

//     await prisma.refreshSession.create({
//       data: {
//         userId: session.user.id,
//         refreshToken: newRefreshToken,
//       },
//     });

//     const newAccessToken = generateAccessToken({
//       userId: session.user.id,
//     });

//     res.cookie("refreshToken", newRefreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       path: "/api/auth/refresh",
//     });

//     res.json({
//       accessToken: newAccessToken,
//       user: {
//         id: session.user.id,
//         name: session.user.name,
//         email: session.user.email,
//       },
//     });
//   } catch (err) {
//     return res.sendStatus(403);
//   }
// });


// router.post("/logout", async (req, res) => {
//   const refreshToken = req.cookies.refreshToken;

//   if (refreshToken) {
//     await prisma.refreshSession.updateMany({
//       where: { refreshToken },
//       data: { revokedAt: new Date() },
//     });
//   }

//   res.clearCookie("refreshToken", {
//     path: "/api/auth/refresh",
//   });

//   res.sendStatus(204);
// });







router.post("/refresh", async (req, res) => {
  console.log("Cookies in refresh:", req.cookies);

  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  try {
    const decoded = verifyRefreshToken(refreshToken);

    const session = await prisma.refreshSession.findUnique({
      where: { refreshToken },
    });

    if (!session || session.userId !== decoded.userId) {
      return res.sendStatus(403);
    }

    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
    });

    res.json({ accessToken: newAccessToken,
     
     });
  } catch (err) {
    return res.sendStatus(403);
  }
});


router.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await prisma.refreshSession.deleteMany({
      where: { refreshToken },
    });
  }

  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
});

export default router;
