const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: String,
  rarity: String,
  description: String,
  image: String, // np. "zoro.png"
  count: Number,
  ownerId: String // id użytkownika
});

module.exports = mongoose.model('Card', cardSchema);