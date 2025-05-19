const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  cid: String,
  count: Number
});

const priceEntrySchema = new mongoose.Schema({
  totalValue: Number,
  date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  displayName: String,
  cards: [cardSchema],
  priceHistory: [priceEntrySchema]
});

// TRZECI ARGUMENT "users" === NAZWA KOLEKCJI W ATLAS
module.exports = mongoose.model('User', userSchema, 'users');