const express = require('express');
const router = express.Router();

// Fake in-memory data store
let menu = [
  { id: 1, name: "Pan de queso", price: 3000 },
  { id: 2, name: "Croissant", price: 5000 }
];

// GET all items
router.get('/', (req, res) => {
  res.json(menu);
});

// POST new item
router.post('/', (req, res) => {
  const newItem = {
    id: Date.now(),
    name: req.body.name,
    price: req.body.price,
  };
  menu.push(newItem);
  res.status(201).json(newItem);
});

// PUT update item
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = menu.findIndex(item => item.id === id);

  if (index !== -1) {
    menu[index] = {
      id,
      name: req.body.name,
      price: req.body.price
    };
    res.json(menu[index]);
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

// DELETE item
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = menu.findIndex(item => item.id === id);

  if (index !== -1) {
    const deleted = menu.splice(index, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

module.exports = router;