import fs from "fs";
import path from "path";

export const PRIVATE_KEY = fs.readFileSync(
  path.resolve("private.key"),
  "utf8"
);

export const PUBLIC_KEY = fs.readFileSync(
  path.resolve("public.key"),
  "utf8"
);
