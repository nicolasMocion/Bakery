import { useEffect, useState } from 'react';

function App() {
  const [menu, setMenu] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  // Fetch menu from backend
  const fetchMenu = () => {
    fetch('http://localhost:4000/menu')
      .then(res => res.json())
      .then(data => setMenu(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const newItem = {
      name,
      price: parseFloat(price),
    };

    fetch('http://localhost:4000/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    })
      .then(res => res.json())
      .then(data => {
        setName('');
        setPrice('');
        fetchMenu(); // Refresh menu
      })
      .catch(err => console.error(err));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🍞 Bakery Menu</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ marginRight: '1rem' }}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          style={{ marginRight: '1rem' }}
        />
        <button type="submit">Add Item</button>
      </form>

      <ul>
        {menu.map(item => (
          <li key={item.id}>
            {item.name} - ${item.price.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;