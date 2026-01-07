import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import { PrismaClient } from "@prisma/client";
import  authRoutes  from "./src/routes/auth.js";
import { protect } from "./src/middleware/auth.js";
import cookieParser from "cookie-parser";


dotenv.config();

const app = express();
const PORT = 3036;

app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const prisma = new PrismaClient();

app.use("/api/auth", authRoutes);

app.get("/protected", protect, (req, res) => {
  res.json({
    message: "Access granted",
    userId: req.userId,
  });
});

app.get("/todos", protect, async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { id: "desc" },
    });
    res.json(todos);
  } catch (err) {
    console.error("/todos error:", err);
    res.status(500).json({ message: "Failed" });
  }
});

app.get("/todos/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const todo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!todo) {
      return res.status(404).json({ message: "No Todo" });
    }

    res.json(todo);
  } catch (err) {
    console.error(" /todos/:id error:", err);
    res.status(500).json({ message: "Failed " });
  }
});


app.post("/todos", protect, async (req, res) => {
  let { title } = req.body;
  title = (title || "").trim();

  if (!title) {
    return res.status(400).json({ message: "all required" });
  }

  try {
    const todo = await prisma.todo.create({
      data: { title },
    });

    res.status(201).json(todo);
  } catch (err) {
    console.error("POST /todos error:", err);
    res.status(500).json({ message: "Failed " });
  }
});


app.put("/todos/:id", protect, async (req, res) => {
  const id = Number(req.params.id);
  let { title } = req.body;
  title = (title || "").trim();

  if (!title) {
    return res.status(400).json({ message: "required" });
  }

  try {
    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: { title },
    });

    res.json(updatedTodo);
  } catch (err) {
    console.error("/todos/:id error:", err);
    res.status(404).json({ message: "Todo not found" });
  }
});


app.delete("/todos/:id", protect, async (req, res) => {
  const id = Number(req.params.id);

  try {
    await prisma.todo.delete({
      where: { id },
    });

    res.json({ message: "Success" });
  } catch (err) {
    console.error("DELETE /todos/:id error:", err);
    res.status(404).json({ message: "No Todo" });
  }
});


app.listen(PORT, () => {
  console.log(`port on  http://localhost:${PORT}`);
});






















// import express from "express";
// import cors from "cors";
// import mysql from "mysql2/promise";

// const app = express();
// const PORT = 3036;

// app.use(cors());
// app.use(express.json());

// const rootPool = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "itMYsql@1",
// });

// const pool = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "itMYsql@1",
//   database: "Todocrud",
// });

// async function initDatabase() {
//   const conn = await rootPool.getConnection();

//   await conn.query(`CREATE DATABASE IF NOT EXISTS Todocrud`);
//   await conn.query(`USE Todocrud`);

//   await conn.query(`
//     CREATE TABLE IF NOT EXISTS todos (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       title VARCHAR(255) NOT NULL
//     )
//   `);

//   conn.release();
//   console.log("DB done");
// }

// initDatabase();


// app.get("/todos", async (req, res) => {
//   try {
//     const [rows] = await pool.query(
//       "SELECT * FROM todos ORDER BY id DESC"

//     );
//     res.json(rows);
//   } catch (err) {
//     console.error("/todos error:", err);
//     res.status(500).json({ message: "Failed " });
//   }
// });

// app.get("/todos/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const [rows] = await pool.query(
//       "SELECT * FROM todos WHERE id = ?",
//       [id]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({ message: "No Todo" });
//     }

//     res.json(rows[0]);
//   } catch (err) {
//     console.error("GET /todos/:id error:", err);
//     res.status(500).json({ message: "Failed to fetch todo" });
//   }
// });

// app.post("/todos", async (req, res) => {
//   let { title } = req.body;
//   title = (title || "").trim();

//   if (!title) {
//     return res.status(400).json({ message: "Title is required" });
//   }

//   try {
//     const [result] = await pool.query(
//       "INSERT INTO todos (title) VALUES (?)",
//       [title]
//     );

//     const [rows] = await pool.query(
//       "SELECT * FROM todos WHERE id = ?",
//       [result.insertId]
//     );

//     res.status(201).json(rows[0]);
//   } catch (err) {
//     console.error("POST /todos error:", err);
//     res.status(500).json({ message: "Failed to create todo" });
//   }
// });

// app.put("/todos/:id", async (req, res) => {
//   const { id } = req.params;
//   let { title } = req.body;
//   title = (title || "").trim();

//   if (!title) {
//     return res.status(400).json({ message: "Title is required" });
//   }

//   try {
//     const [existing] = await pool.query(
//       "SELECT * FROM todos WHERE id = ?",
//       [id]
//     );

//     if (existing.length === 0) {
//       return res.status(404).json({ message: "Todo not found" });
//     }

//     await pool.query(
//       "UPDATE todos SET title = ? WHERE id = ?",
//       [title, id]
//     );

//     const [updated] = await pool.query(
//       "SELECT * FROM todos WHERE id = ?",
//       [id]
//     );

//     res.json(updated[0]);
//   } catch (err) {
//     console.error("PUT /todos/:id error:", err);
//     res.status(500).json({ message: "Failed to update todo" });
//   }
// });

// app.delete("/todos/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const [result] = await pool.query(
//       "DELETE FROM todos WHERE id = ?",
//       [id]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "No Todo " });
//     }

//     res.json({ message: "Success" });
//   } catch (err) {
//     console.error("/todos/:id error:", err);
//     res.status(500).json({ message: "Failed to delete " });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`port on http://localhost:${PORT}`);
// });
