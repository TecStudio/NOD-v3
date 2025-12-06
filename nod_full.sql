-- NOD v3 – Base de datos completa (sin usuarios pre-cargados)

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS friends;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS group_members;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS private_chats;
DROP TABLE IF EXISTS group_messages;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  phone TEXT,
  password TEXT,
  token TEXT
);

CREATE TABLE friends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_phone TEXT,
  friend_phone TEXT
);

CREATE TABLE groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  owner TEXT
);

CREATE TABLE group_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER,
  member_phone TEXT
);

CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user TEXT,
  text TEXT,
  time TEXT
);

CREATE TABLE private_chats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_from TEXT,
  user_to TEXT,
  text TEXT,
  time TEXT
);

CREATE TABLE group_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER,
  user TEXT,
  text TEXT,
  time TEXT
);
