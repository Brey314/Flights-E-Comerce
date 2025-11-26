const mongoose = require('mongoose');

const flightsSchema = new mongoose.Schema({
  from: String,
  to: String,
  price: Number,
  scale1: String,
  scale2: String,
  scale3: String,
  company: String,
  chairs: Number,
  flight_date: String,
  flight_time: String,
  creation_date: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

module.exports = mongoose.model('flights', flightsSchema);