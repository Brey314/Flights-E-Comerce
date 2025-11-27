const mongoose = require('mongoose');

const reservation = new mongoose.Schema({
  idFlight:String,
  idUser: String,
  chairs_reserved: Number,
  category: {
    type: String,
    enum: ['Economy', 'Business', 'First Class'],
    default: 'Economy'
  },
  update_date: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

module.exports = mongoose.model('reservation', reservation);
