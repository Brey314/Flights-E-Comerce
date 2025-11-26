const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const checkToken = require('../middleware/auth');

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
  try {
    const { user,pass } = req.body;
    if (!user || !pass) return res.status(400).json({ error: 'Missing Credentials' });
    const useer = await User.findOne({ user });
    if (!useer) return res.status(401).json({ error: 'User not found' });
    const coincide = await useer.compararPassword(pass);
    if (!coincide) return res.status(401).json({ error: 'Password incorrect' });

    const token = jwt.sign(
      { id: useer._id, user: useer.user, rol: useer.rol },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: true, //en caso de https
      sameSite: 'None',
      maxAge: 2 * 60 * 60 * 1000, // 2 horas
    });
    res.json({
      message: 'Succes Login',
      token,
      useer: { id: useer._id, user: useer.user, rol: useer.rol }
    });
    console.log("Login Succes",token);
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Autentication Error ' });
  }
});

router.post('/register', async (req, res) => {
  try {

    const { name, email ,user,pass, rol } = req.body;

    if (!name || !email||!user||!pass || !rol) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const existente = await User.findOne({ user });
    if (existente) {
      return res.status(400).json({ error: 'The user already exists' });
    }
    const newuseer = new User({ name, email ,user,pass, rol });
    await newuseer.save();
    console.log("new user create",newuseer);
    res.status(201).json({ message: 'new user create' });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Error creating user' });
  }
});

router.get("/check", checkToken, async (req, res) => {
  console.log("Check: Token verified, user ID:", req.usuario.id);
  const users = await User.findById(req.usuario.id).select("name email user rol ");
  console.log("Check: Usuario found:", users ? users.user : "null");
  res.json({ user: { id: users._id, user: users.user, rol: users.rol, name: users.name, email: users.email } });
});

module.exports = router;