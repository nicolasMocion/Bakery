const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('bakery.db');

// Create table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT
    )
  `);
});

module.exports = db;