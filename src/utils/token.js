import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const PRIVATE_KEY = fs.readFileSync(
  path.join(process.cwd(), "private.key"),
  "utf8"
);

const PUBLIC_KEY = fs.readFileSync(
  path.join(process.cwd(), "public.key"),
  "utf8"
);

export const generateAccessToken = (payload) =>
  jwt.sign(payload, PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: "1m",
  });

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: "7m",
  }); 

export const verifyAccessToken = (token) =>
  jwt.verify(token, PUBLIC_KEY, { algorithms: ["RS256"] });

export const verifyRefreshToken = (token) =>
  jwt.verify(token, PUBLIC_KEY, { algorithms: ["RS256"] });
