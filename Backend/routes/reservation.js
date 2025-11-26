const express = require('express');
const router = express.Router();
const Reservation = require('../models/reservation');
const jwt = require("jsonwebtoken");
require('dotenv').config();
const checkToken = require('../middleware/auth');
const JWT_SECRET = process.env.JWT_SECRET;

// Get flight in reservations
router.get("/", async(req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      console.log("No token provided in reservation GET");
      return res.status(401).json({ error: "unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const idUser = decoded.id;
    console.log("Fetching reservations for user:", idUser);

    const reservation = await Reservation.find({ idUser });
    console.log("Reservations found:", reservation.length, "items");

    res.json(reservation);
  } catch (err) {
    console.error("Error in reservation GET:", err);
    res.status(500).json({ error: 'Fail to get flights' });
  }
});

// add flight in reservations
router.post("/", async(req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      console.log("No token provided in reservation POST");
      return res.status(401).json({ error: "unauthorized" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const idUser = decoded.id;
    console.log("Creating reservation for user:", idUser);
    const { idFlight,cuantity } = req.body;
    console.log("Reservation data: idFlight=", idFlight, "cuantity=", cuantity);
    const newFlight = new Reservation({
      idFlight,
      idUser,
      chairs_reserved:cuantity
    });
    const reservationSave = await newFlight.save();
    console.log("Reservation saved successfully:", reservationSave);
    res.status(201).json({ message: "Flight add", reservationSave });
  } catch (err) {
    console.error('Error creating reservation:', err);
    res.status(500).json({ error: 'Error creating reservation' });
  }
});

// update reservation quantity
router.put("/:idFlight",checkToken, async(req, res) => {
  try{
    console.log('PUT reservation: idFlight from params:', req.params.idFlight);
    console.log('PUT reservation: body:', req.body);

    const {idFlight}=req.params;
    const updatedData = req.body;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, JWT_SECRET);
    const idUser = decoded.id;
    let reservation=null;
    // Buscar la reserva por idFlight y idUser
    console.log('PUT reservation: Searching for reservation with idFlight:', idFlight, 'idUser:', idUser);
    reservation = await Reservation.findOneAndUpdate({idFlight, idUser}, updatedData, { new: true });
    console.log('PUT reservation: Find result:', reservation);
    if (!reservation) {
      console.log('PUT reservation: Reservation not found');
      return res.status(404).json({ message: `Reserva con idFlight ${idFlight} no encontrada` });
    }

    console.log('PUT reservation: Updated successfully:', reservation);
    res.json({ message: "Cantidad actualizada", reservation });
    console.log("Cantidad de la reserva actualizada", reservation);
  }catch (err) {
    console.error('Error al actualizar reserva:', err);
    res.status(500).json({ error: 'Error al actualizar reserva' });
  }
});

// delete flight with idFlight
router.delete("/:idFlight", async(req, res) => {
  try{
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "unauthorized" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const idUser = decoded.id;
    const { idFlight } = req.params;
    console.log("Deleting reservation for idFlight:", idFlight, "idUser:", idUser);
    const deleted = await Reservation.findOneAndDelete({idFlight, idUser});
    if (!deleted) {
      return res.status(404).json({ message: `Reserva con idFlight ${idFlight} no encontrada` });
    }
    console.log("Reservation deleted:", deleted);
    res.status(201).json({ message: `Reserva con idFlight ${idFlight} eliminada` });
  }catch (err) {
    console.error('Error deleting reservation:', err);
    res.status(500).json({ error: 'Error deleting reservation' });
  }
});

// delete  flight with id when pay
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