const express = require('express');
const cors = require('cors');
const app = express();
const menuRoutes = require('./routes/menu'); // Make sure this path exists

app.use(cors());
app.use(express.json());

app.use('/menu', menuRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🍞 Bakery backend running at http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('🍞 Welcome to the Bakery Backend API');
});