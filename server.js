
const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

const { promisify } = require("util");



const db = new sqlite3.Database(path.join(__dirname, 'bakery.db'), (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('📦 Connected to SQLite database.');
  }
});

// Promisify the db methods after the db is initialized
const dbAll = promisify(db.all.bind(db));
const dbRun = promisify(db.run.bind(db));
const dbPrepare = promisify(db.prepare.bind(db));

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Make sure this is before any routes that expect JSON input
app.use(express.static(path.join(__dirname, 'public'))); // Static assets (HTML, CSS, JS)
app.use(bodyParser.urlencoded({ extended: true }));


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

// Middleware para parsear datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));

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

//Get menu

app.get("/api/menu", async (req, res) => {
  try {
    const menu = await dbAll(`
      SELECT products.* 
      FROM menu 
      JOIN products ON menu.product_id = products.id
    `);
    res.json(menu);
  } catch (err) {
    console.error("❌ Error fetching menu:", err.message);
    res.status(500).json({ error: "Error fetching menu" });
  }
});

//Update today's menu
app.post("/api/menu", async (req, res) => {
  const newMenu = req.body; // array of { id, name, ... } or just product IDs
  
  console.log("Received menu data:", newMenu);  // Check the data being sent
  
  try {

    // Step 2: Prepare the insert statement for product IDs
    const stmt = db.prepare("INSERT INTO menu (product_id) VALUES (?)");

    if (!stmt) {
      throw new Error("Failed to prepare the SQL statement");
    }

    // Step 3: Iterate through each item in the new menu and insert product IDs
    for (const item of newMenu) {
      const productId = item.id || item.product_id;

      try {
        console.log(`Inserting product with ID: ${productId}`);
        await stmt.run(productId);
      } catch (insertError) {
        if (insertError.code === "SQLITE_CONSTRAINT") {
          console.log(`Product with ID: ${productId} already exists in the menu.`);
        } else {
          throw insertError;  // Rethrow any other errors
        }
      }
    }

    // Step 4: Finalize the prepared statement once all products have been inserted
    await stmt.finalize();

    // Respond with a success message
    res.json({ success: true });

  } catch (err) {
    console.error("❌ Error updating menu:", err.message);
    res.status(500).json({ error: "Error updating menu" });
  }
});

// Get a single product by ID (necesario para el botón "Editar")
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;

  const query = `SELECT * FROM products WHERE id = ?`;
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('❌ Error fetching product:', err.message);
      return res.status(500).json({ error: 'Failed to fetch product' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(row);
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

// Delete all the menu

app.delete("/api/menu", async (req, res) => {
  try {
    // Step 1: Delete all entries from the 'menu' table
    await dbRun("DELETE FROM menu");

    // Step 2: Reset the auto-increment counter for 'menu' table
    // This will reset the auto-increment value to 1
    await dbRun("UPDATE sqlite_sequence SET seq = 0 WHERE name = 'menu'");

    // Respond with a success message
    res.json({ success: true, message: "Menu cleared and auto-increment counter reset." });
  } catch (err) {
    console.error("❌ Error resetting menu:", err.message);
    res.status(500).json({ error: "Error resetting menu" });
  }
});

// Ruta de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('🔐 Attempted login with:', username);

  const query = 'SELECT * FROM users WHERE username = ?';
  db.get(query, [username], (err, user) => {
    if (err) {
      console.error('❌ Error querying database:', err.message);
      return res.status(500).json({ success: false, message: 'Error del servidor' });
    }

    if (!user) {
      // Username not found
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }

    // Compare entered password with hashed password from DB
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        console.error('❌ Error comparing passwords:', err);
        return res.status(500).json({ success: false, message: 'Error del servidor' });
      }

      if (result) {
        // Passwords match
        console.log('✅ Login successful for:', username);
        res.json({ success: true, message: 'Login successful!' });
      } else {
        // Passwords do not match
        console.log('❌ Invalid password for:', username);
        res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
      }
    });
  });
});

//Delete one
app.delete("/api/menu/:productId", async (req, res) => {
  const { productId } = req.params;
  console.log('Attempting to delete product with ID:', productId);
  
  try {
    const result = await dbRun("DELETE FROM menu WHERE product_id = ?", productId);
    console.log('Delete result:', result); // Log result to help debug

    res.json({ success: true, message: "Producto eliminado del menú." });
  } catch (err) {
    console.error("❌ Error deleting menu item:", err.message);
    res.status(500).json({ error: "Error deleting menu item", details: err.message });
  }
});

// Catch-all for frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
