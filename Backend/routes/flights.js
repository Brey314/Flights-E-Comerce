const express = require('express');
const router = express.Router();
const Flights = require('../models/flights');

//consultar vuelos
router.get('/', async (req, res) => {
  try {
    console.log('Received query:', req.query);
    const { from, to, date, time, category, company, direct } = req.query;
    let query = {};
    if (from) query.from = from;
    if (to) query.to = to;
    if (date) {
      console.log('Date received:', date);
      query.flight_date = date;
    }
    if (time) query.flight_time = time;
    if (company) query.company = company;
    if (direct === "true") {
      query.scale1 = "";
    }
    console.log('Final query:', query);
    let flights = await Flights.find(query);
    console.log('Flights found:', flights.length);
    if (flights.length === 0) {
      return res.status(404).json({ error: 'No se encontraron vuelos' });
    }
    res.json(flights);
  } catch (err) {
    console.error('Error in flights route:', err);
    res.status(500).json({ error: 'Error al obtener ' });
  }
});

module.exports = router;