const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/bakery.db');

// Example table setup
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      message TEXT
    )
  `);
});

module.exports = db;
