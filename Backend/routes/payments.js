const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const axios = require("axios");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const api=process.env.REACT_APP_API_URL;
// Crea una sesión de Checkout
// Espera recibir en el body { items: [{ name, unit_amount, quantity, currency }], success_url, cancel_url }
router.post("/create-checkout-session", async (req, res) => {
  try {
    console.log("Create checkout session called - code updated");
    const token = req.cookies.token;
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const { items, success_url, cancel_url } = req.body;

    // Items are already with addressId
    const processedItems = items;

    // Mapear items al formato que Stripe espera
    const line_items = processedItems.map(item => ({
      price_data: {
        currency: item.currency || "USD",
        product_data: { name: item.name },
        unit_amount: Math.round(item.unit_amount),
      },
      quantity: item.quantity,
    }));

    // Prepare metadata items with only essential fields to stay under 500 char limit
    const metadataItems = processedItems.map(item => ({
      c: item._id,
      p: item.flightId,
      q: item.quantity,
      u: item.unit_amount
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      metadata: {
        items: JSON.stringify(metadataItems),
        userId: userId
      },
      success_url: success_url || "http://localhost:3000/success/{CHECKOUT_SESSION_ID}",
      cancel_url: cancel_url || "http://localhost:3000/cancel",
    });

    // Devuelvo la url para redirigir
    res.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(500).json({ error: err.message });
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
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log(session);
    // session contiene: id, amount_total, currency, customer_details, metadata, etc.
    console.log("Checkout session completed:", session.id);
    const items = JSON.parse(session.metadata.items).map(i => ({
      _id: i.c,
      flightId: i.p,
      chairs_reserved: i.q,
      unit_amount: i.u
    }));
    const userId = session.metadata.userId;
    console.log("Tikets:", items);
    console.log("User ID:", userId);

    for (const item of items) {
      }
    }
    res.status(200).send('OK');
  
});

module.exports = router;
