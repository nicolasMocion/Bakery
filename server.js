// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // 'public' contains your HTML, CSS, JS, etc.

// SQLite database setup
const db = new sqlite3.Database(path.join(__dirname, 'bakery.db'), (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('📦 Connected to SQLite database.');
  }
});

// Initialize database tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT
    )
  `);
});

// --- API Routes ---

// Get all products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      console.error('❌ Error retrieving products:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve products' });
    }
    res.json(rows);
  });
});

// Add a new product
app.post('/api/products', (req, res) => {
  const { name, description, price, image } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  const query = `INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)`;
  db.run(query, [name, description, price, image], function (err) {
    if (err) {
      console.error('❌ Error inserting product:', err.message);
      return res.status(500).json({ error: 'Failed to add product' });
    }
    res.status(201).json({ id: this.lastID });
  });
});

// Update a product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price, image } = req.body;

  const query = `UPDATE products SET name = ?, description = ?, price = ?, image = ? WHERE id = ?`;
  db.run(query, [name, description, price, image, id], function (err) {
    if (err) {
      console.error('❌ Error updating product:', err.message);
      return res.status(500).json({ error: 'Failed to update product' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully' });
  });
});

// Delete a product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('❌ Error deleting product:', err.message);
      return res.status(500).json({ error: 'Failed to delete product' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

// Catch-all for frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
