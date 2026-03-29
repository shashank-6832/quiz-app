require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "quizuser",
  password: process.env.DB_PASSWORD || "quizpass",
  database: process.env.DB_NAME || "quizdb",
});

const SEED_QUESTIONS = [
  {
    question: "What does CPU stand for?",
    options: ["Central Processing Unit", "Core Processing Unit", "Central Program Utility", "Core Program Unit"],
    correct_answer: 0,
    category: "Computer Science",
  },
  {
    question: "Which data structure uses LIFO (Last In, First Out) order?",
    options: ["Queue", "Stack", "Linked List", "Tree"],
    correct_answer: 1,
    category: "Data Structures",
  },
  {
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(n²)", "O(log n)", "O(1)"],
    correct_answer: 2,
    category: "Algorithms",
  },
  {
    question: "Which layer of the OSI model handles routing?",
    options: ["Data Link", "Transport", "Network", "Session"],
    correct_answer: 2,
    category: "Networking",
  },
  {
    question: "What command initializes a new Git repository?",
    options: ["git start", "git init", "git new", "git create"],
    correct_answer: 1,
    category: "Git",
  },
  {
    question: "Which HTTP method is used to update an existing resource?",
    options: ["GET", "POST", "DELETE", "PUT"],
    correct_answer: 3,
    category: "Web",
  },
  {
    question: "What does DNS stand for?",
    options: ["Domain Name System", "Dynamic Name Server", "Data Network Service", "Domain Network System"],
    correct_answer: 0,
    category: "Networking",
  },
  {
    question: "In Docker, what does a Dockerfile define?",
    options: ["A container runtime", "A network policy", "An image build process", "A Kubernetes pod"],
    correct_answer: 2,
    category: "DevOps",
  },
  {
    question: "Which sorting algorithm has the best average-case time complexity?",
    options: ["Bubble Sort", "Merge Sort", "Quick Sort", "Insertion Sort"],
    correct_answer: 2,
    category: "Algorithms",
  },
  {
    question: "What is the primary purpose of an OS kernel?",
    options: ["Render graphics", "Manage hardware resources", "Run user applications", "Handle network packets"],
    correct_answer: 1,
    category: "Operating Systems",
  },
];

async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_answer INTEGER NOT NULL,
        category VARCHAR(100)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        player_name VARCHAR(100) NOT NULL,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const { rows } = await client.query("SELECT COUNT(*) FROM questions");
    if (parseInt(rows[0].count) === 0) {
      for (const q of SEED_QUESTIONS) {
        await client.query(
          "INSERT INTO questions (question, options, correct_answer, category) VALUES ($1, $2, $3, $4)",
          [q.question, JSON.stringify(q.options), q.correct_answer, q.category]
        );
      }
      console.log("✅ Database seeded with questions.");
    }

    console.log("✅ Database initialized successfully.");
  } finally {
    client.release();
  }
}

// ── Routes ─────────────────────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/questions", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, question, options, category FROM questions ORDER BY RANDOM()"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

app.post("/api/scores", async (req, res) => {
  const { player_name, score, total } = req.body;
  if (!player_name || score === undefined || !total) {
    return res.status(400).json({ error: "player_name, score, and total are required" });
  }
  try {
    const { rows } = await pool.query(
      "INSERT INTO scores (player_name, score, total) VALUES ($1, $2, $3) RETURNING *",
      [player_name.trim(), score, total]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error saving score:", err);
    res.status(500).json({ error: "Failed to save score" });
  }
});

app.get("/api/scores", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT player_name, score, total, created_at FROM scores ORDER BY score DESC, created_at DESC LIMIT 10"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching scores:", err);
    res.status(500).json({ error: "Failed to fetch scores" });
  }
});

// ── Start ───────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

async function startServer() {
  let retries = 10;
  while (retries > 0) {
    try {
      await initDatabase();
      break;
    } catch (err) {
      console.log(`⏳ Waiting for database... (${retries} retries left)`);
      retries--;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 Quiz backend running on port ${PORT}`);
  });
}

startServer();
