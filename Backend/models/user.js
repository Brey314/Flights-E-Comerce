const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  user: { type: String, required: true, unique: true },
  pass: { type: String, required: true },
  rol: { type: String, default: "Consumer" },
  creation_date: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

// Antes de guardar, encripta la contraseña
userSchema.pre('save', async function () {
  if (!this.isModified('pass')) return;
  const salt = await bcrypt.genSalt(10);
  this.pass = await bcrypt.hash(this.pass, salt);
});

// Método para comparar contraseñas
userSchema.methods.compararPassword = async function (passIngresada) {
  return await bcrypt.compare(passIngresada, this.pass);
};

module.exports = mongoose.model('user', userSchema);