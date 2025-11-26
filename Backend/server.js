const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const flightsRoutes = require('./routes/flights');
const usersRoutes = require('./routes/users');
const reservationRoutes = require('./routes/reservation')
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors({
  origin: ['http://localhost:5000',"http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use(cookieParser());
app.use('/api/flights', flightsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reservation', reservationRoutes);

// MongoDB Connection
console.log(MONGO_URI);
mongoose.connect(MONGO_URI)
.then(() => {
  console.log(' Conectado a MongoDB');
  app.listen(PORT, () => console.log(` Servidor corriendo en http://localhost:${PORT}`));
})
.catch(err => console.error(' Error en MongoDB:', err));

// Server is started inside mongoose connect