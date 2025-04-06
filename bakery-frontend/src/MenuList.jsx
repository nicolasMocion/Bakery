// src/components/MenuList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MenuList = () => {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:4000/menu')
      .then(response => {
        setMenu(response.data);
      })
      .catch(error => {
        console.error('Error fetching menu:', error);
      });
  }, []);

  return (
    <div>
      <h2>🥐 Bakery Menu</h2>
      <ul>
        {menu.map(item => (
          <li key={item.id}>
            <strong>{item.name}</strong> — ${item.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MenuList;