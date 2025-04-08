const express = require('express');
const path = require('path');
const { db, initializeDatabase } = require('./server/db.js');

const app = express();
const PORT = process.env.PORT || 3000;

// 🛠 Inicializar base de datos
initializeDatabase();

// 📁 Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 📄 Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// 📦 Obtener productos
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ➕ Agregar producto
app.post('/api/products', (req, res) => {
  const { name, description, price, image } = req.body;
  db.run(
    `INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)`,
    [name, description, price, image],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

// 🧾 Obtener menú
app.get('/api/menu', (req, res) => {
  db.all('SELECT * FROM menu', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 🧾 Agregar al menú
app.post('/api/menu', (req, res) => {
  const { name, description, price } = req.body;
  db.run(
    `INSERT INTO menu (name, description, price) VALUES (?, ?, ?)`,
    [name, description, price],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

// ✅ Servidor encendido
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
