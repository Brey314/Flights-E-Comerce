const express = require('express');
const router = express.Router();
const Flights = require('../models/flights');


router.get('/', async (req, res) => {
  try {
    const { from, to, date } = req.query;
    let query = {};
    if (from) query.from = from;
    if (to) query.to = to;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.flight_date = { $gte: startDate, $lt: endDate };
    }
    let flights = await Flights.find(query);
    if (flights.length === 0) {
      return res.status(404).json({ error: 'No se encontraron vuelos' });
    }
    res.json(flights);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ' });
  }
});

module.exports = router;