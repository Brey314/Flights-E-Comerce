const express = require('express');
const router = express.Router();
const Reservation = require('../models/reservation');
const jwt = require("jsonwebtoken");
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

// Obtener productos del carrito
router.get("/", async(req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const idUser = decoded.id;

    const reservation = await Reservation.find({ idUser });

    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: 'Fail to get flights' });
  }
});

// Agregar producto al carrito
router.post("/", async(req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "unauthorized" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const idUser = decoded.id;
    //console.log(idUser);
    const { idProd,cuantity } = req.body;
    const newFlight = new Reservation({ 
      idProd,
      idUser,
      chairs_reserved
    });
    const reservationSave = await newFlight.save();
    console.log("Flight added with token=",token);
    console.log(newFlight);
    res.status(201).json({ message: "Flight add", reservationSave });
  } catch (err) {
    console.error('Error creating reservation:', err);
    res.status(500).json({ error: 'Error creating reservation' });
  }
});

// Eliminar producto por id
router.delete("/:_id", async(req, res) => {
  try{
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "unauthorized" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const idUser = decoded.id;
    const { _id } = req.params;
    //console.log(_id);
    await Reservation.findByIdAndDelete((_id));
    console.log("Flight deleted ");
    res.status(201).json({ message: `Flight with id ${_id} deleted` });
  }catch (err) {
    console.error('Error updating reservation:', err);
    res.status(500).json({ error: 'Error updating reservation' });
  }
});

// Eliminar producto por id al comprar
router.delete("/payed/:_id", async(req, res) => {
  try{
    const { _id } = req.params;
    //console.log(_id);
    await Reservation.findByIdAndDelete((_id));
    console.log("Product purchased from cart and deleted");
    res.status(201).json({ message: `Flight with id ${_id} deleted` });
  }catch (err) {
    console.error('Error updating reservation:', err);
    res.status(500).json({ error: 'Error updating reservation' });
  }
});

module.exports = router;