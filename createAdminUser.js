
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'bakery.db'));
const saltRounds = 10;

const username = 'OmarAdmin';
const plainPassword = 'omar';

db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);


bcrypt.hash(plainPassword, saltRounds, (err, hashedPassword) => {
    if (err) {
        return console.error('Error al hashear contraseña:', err);
    }

    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.run(sql, [username, hashedPassword], function (err) {
        if (err) {
            return console.error('Error al crear usuario admin:', err.message);
        }
        console.log('✅ Usuario admin creado con éxito con ID:', this.lastID);
        db.close();
    });
});