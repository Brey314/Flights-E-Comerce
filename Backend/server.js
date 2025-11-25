const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const flightsRoutes = require('./routes/flights');

require('dotenv').config();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Routes
app.use('/api/flights', flightsRoutes);

// MongoDB Connection
console.log(MONGO_URI);
mongoose.connect(MONGO_URI, {
})
.then(() => {
  console.log(' Conectado a MongoDB');
  app.listen(PORT, () => console.log(` Servidor corriendo en http://localhost:${PORT}`));
})
.catch(err => console.error(' Error en MongoDB:', err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});