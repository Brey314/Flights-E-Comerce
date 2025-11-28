const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const flightsRoutes = require('./routes/flights');
const usersRoutes = require('./routes/users');
const reservationRoutes = require('./routes/reservation');
const paymentRoutes = require('./routes/payments');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

//MONGO_URI=url of MongoDB Atlas, when deploy should open the public ip address of the backend
//PORT=5000
//JWT_SECRET=generated in Git Bash with: openssl rand -hex 32
//STRIPE_SECRET_KEY=key generated when create stripe account
//STRIPE_WEBHOOK_SECRET=key generated when create a webhook, remember host the backend with ngrok or with a service like this and change the connection point on the Stripe Webhook dashboard
//REACT_APP_API_URL=in this case http://localhost:5000
//SENDGRID_API_KEY=key generated in Sendgrid
// Middleware
app.use(cors({
  origin: ['http://localhost:5000',"http://localhost:3000"],
  credentials: true,
}));
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Routes
app.use(cookieParser());
app.use('/api/flights', flightsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reservation', reservationRoutes);
app.use('/api',paymentRoutes);

// MongoDB Connection
console.log(MONGO_URI);
mongoose.connect(MONGO_URI)
.then(() => {
  console.log(' Conectado a MongoDB');
  app.listen(PORT, () => console.log(` Servidor corriendo en http://localhost:${PORT}`));
})
.catch(err => console.error(' Error en MongoDB:', err));

// Server is started inside mongoose connect