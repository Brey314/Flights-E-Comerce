const express = require('express');
const router = express.Router();
const Flights = require('../models/flights');


router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query;
    const flights = await Flights.find({ from: from, to: to });
    res.json(flights);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

module.exports = router;