// NOD v3 – Alpha Build 1
import express from "express";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = "NOD_SECRET_KEY";
const PORT = process.env.PORT || 1234;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "client")));

// --- DB SETUP ---
const db = await open({
  filename: path.join(__dirname, "nod.db"),
  driver: sqlite3.Database
});
await db.exec(`CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, phone TEXT, password TEXT, token TEXT
);`);
await db.exec(`CREATE TABLE IF NOT EXISTS messages(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user TEXT, text TEXT, time TEXT
);`);

// --- HELPERS ---
function genPhone(n) {
  return `+NOD-${n.toString().padStart(4, "0")}`;
}
function makeToken(data) {
  return jwt.sign(data, JWT_SECRET, { expiresIn: "1d" });
}
function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); }
  catch { return null; }
}

// --- SIGNUP ---
app.post("/api/signup", async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) return res.json({ ok: false, error: "Faltan datos" });
  const hashed = await bcrypt.hash(password, 8);
  const count = (await db.get(`SELECT COUNT(*) as c FROM users`)).c + 1;
  const phone = genPhone(count);
  const token = makeToken({ phone });
  await db.run(`INSERT INTO users(name,phone,password,token) VALUES(?,?,?,?)`,
    [name, phone, hashed, token]);
  res.json({ ok: true, user: { name, phone, token } });
});

// --- LOGIN ---
app.post("/api/login", async (req, res) => {
  const { phone, password } = req.body;
  const user = await db.get(`SELECT * FROM users WHERE phone=?`, [phone]);
  if (!user) return res.json({ ok: false, error: "Usuario no existe" });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ ok: false, error: "Contraseña incorrecta" });
  const token = makeToken({ phone });
  await db.run(`UPDATE users SET token=? WHERE phone=?`, [token, phone]);
  res.json({ ok: true, user: { name: user.name, phone, token } });
});

// --- AUTH ---
app.post("/api/auth", async (req, res) => {
  const userData = verifyToken(req.body.token);
  if (!userData) return res.json({ ok: false });
  const user = await db.get(`SELECT name,phone FROM users WHERE phone=?`, [userData.phone]);
  if (!user) return res.json({ ok: false });
  res.json({ ok: true, user });
});

// --- SOCKET.IO ---
io.on("connection", socket => {
  console.log("🟢", socket.id);

  socket.on("auth", async token => {
    const data = verifyToken(token);
    if (!data) return socket.emit("auth:failed");
    socket.phone = data.phone;
    socket.emit("auth:ok", data.phone);
  });

  socket.on("chat message", async data => {
    if (!socket.phone) return;
    const msg = {
      user: socket.phone,
      text: data.text.substring(0, 400),
      time: new Date().toLocaleTimeString()
    };
    await db.run(`INSERT INTO messages(user,text,time) VALUES(?,?,?)`,
      [msg.user, msg.text, msg.time]);
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => console.log("🔴", socket.id));
});

server.listen(PORT, () =>
  console.log(`🔥 NOD v3 corriendo en http://localhost:${PORT}`)
);
