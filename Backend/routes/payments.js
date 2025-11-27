const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const api=process.env.REACT_APP_API_URL;
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
// Crea una sesión de Checkout
// Espera recibir en el body { items: [{ name, unit_amount, quantity, currency }], success_url, cancel_url }
router.post("/create-payment-intent", async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const { items } = req.body;
    console.log("Received items:", items);
    console.log("Checking email in items:", items.map(item => ({ id: item._id, email: item.email })));

    const amount = items.reduce(
      (sum, item) => {
        console.log(`Item: unit_amount=${item.unit_amount}, quantity=${item.quantity}`);
        return sum + (item.unit_amount * 100) * item.quantity; // unit_amount in dollars, convert to cents
      },
      0
    );
    console.log("Calculated amount in cents:", amount);

    // metadata compacta
    const metadataItems = items.map(item => ({
      c: item._id,
      p: item.flightId,
      q: item.quantity,
      u: item.unit_amount,
      e: item.email,
      n: item.name
    }));

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        items: JSON.stringify(metadataItems),
        userId
      }
    });

    console.log("DEBUG: Payment intent created successfully:", paymentIntent.id, "status:", paymentIntent.status, "client_secret:", paymentIntent.client_secret ? "present" : "null");

    res.send({
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

// Retrieve session details
router.get("/payment/session/:id", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id);
    res.json(session);
  } catch (err) {
    console.error("Error retrieving session:", err);
    res.status(500).json({ error: err.message });
  }
});

// Webhook endpoint para recibir confirmación de pago
router.post("/webhook", async (req, res) => {
  console.log("Webhook received. Body type:", typeof req.body, "Body length:", req.body ? req.body.length : 'null');
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar evento de pago completado
  if (event.type === "payment_intent.succeeded") {
    const session = event.data.object;
    console.log("DEBUG: Webhook received payment_intent.succeeded, id:", session.id, "status:", session.status);
    console.log(JSON.parse(session.metadata.items));
    // session contiene: id, amount_total, currency, customer_details, metadata, etc.
    console.log("Checkout session completed:", session.id);
    const items = JSON.parse(session.metadata.items).map(i => ({
      _id: i.c,
      flightId: i.p,
      chairs_reserved: i.q,
      unit_amount: i.u,
      email: i.e,
      name: i.n
    }));
    const userId = session.metadata.userId;
    console.log("Tikets:", items);
    console.log("User ID:", userId);
    console.log("DEBUG: Parsed items emails:", items.map(item => item.email));

    for (const item of items) {
      const to=item.email;
      console.log("Sending email to:", to);
      console.log("From email:", "no-reply@breyflights.com");
      console.log("SendGrid API key set:", process.env.SENDGRID_API_KEY ? "Yes" : "No");
      try {
// sgMail.setDataResidency('eu'); 
// uncomment the above line if you are sending mail using a regional EU subuser

        const msg = {
          to, // Change to your recipient
          from: 'benabidesreysanti@outlook.com', // Change to your verified sender
          subject: `Payment Confirmation of your ${item.name} in BreyFlights`,
          text: `Thank you for your purchase with BreyFlights! Your payment has been successfully processed. Here are your ticket details:
            🛫 Flight: ${item.name}
            💺 Reserved seats: ${item.chairs_reserved}
            💵 Total paid: $${item.unit_amount}
            📘 Internal code: ${item._id}

            If you have any questions or need assistance, feel free to contact us.
            Safe travels,
            The BreyFlights Team`
        }
        sgMail
          .send(msg)
          .then(() => {
            console.log('Email sent')
          })
          .catch((error) => {
            console.error(error)
          })
        console.log("Email sent successfully to:", to);
      } catch (emailErr) {
        console.error("SendGrid error:", emailErr.message);
        // Continue processing other items or handle as needed
      }
      }
    }
    

    res.status(200).send('OK');
  
});


module.exports = router;
