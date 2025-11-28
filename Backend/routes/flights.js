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

router.put('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { chairs, category } = req.body;
    const flight = await Flights.findById(id);
    if (!flight) return res.status(404).json({ error: 'Flight Notfound' });

    let stockField;
    if (category === 'Business') {
      stockField = 'chair_business';
    } else if (category === 'Economy') {
      stockField = 'chairs';
    } else {
      return res.status(400).json({ error: 'Invalid category' });
    }

    if (flight[stockField] < chairs) return res.status(400).json({ error: `No ${category} chairs enough` });
    flight[stockField] -= chairs;
    await flight.save();
    res.json({ message: `${category} chairs updated`, [stockField]: flight[stockField] });
  } catch (err) {
    res.status(500).json({ error: 'Error updating chairs' });
  }
});

router.get("/:id/seats", async (req, res) => {
  try {
    console.log('Backend req.params.id:', req.params.id);
    const flight = await Flights.findById(req.params.id);

    if (!flight)
      return res.status(404).json({ error: "Flight not found" });

    res.json({ takenSeats: flight.chairs_selected });
  } catch (e) {
    console.error("Error getting taken seats:", e);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/:id/select-seats", async (req, res) => {
  try {
    const { seats } = req.body; // ["12A", "12B"]

    const flight = await Flights.findById(req.params.id);
    if (!flight) return res.status(404).json({ error: "Flight not found" });

    // Verificar que no existan duplicados
    const conflict = seats.some(s => flight.chairs_selected.includes(s));
    if (conflict) {
      return res.status(400).json({ error: "One or more seats already taken" });
    }

    // Guardar
    flight.chairs_selected.push(...seats);

    // Actualizar sillas disponibles
    flight.chairs = flight.static_chairs - flight.chairs_selected.length;

    await flight.save();

    res.json({ success: true, seats: flight.chairs_selected });
  } catch (e) {
    console.error("Error saving selected seats:", e);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;