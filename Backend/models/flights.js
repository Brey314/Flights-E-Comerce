const mongoose = require('mongoose');
console.log('Loading flights model');

const flightsSchema = new mongoose.Schema({
  form: String,
  to: String,
  price: Number,
  sclae1: String,
  sclae2: String,
  sclae3: String,
  company: String,
  chairs: Number,
  flight_date: Date,
  creation_date: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

module.exports = mongoose.model('flights', flightsSchema);