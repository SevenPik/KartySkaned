const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: String,
  rarity: String,
  description: String,
  image: String
});

module.exports = mongoose.model('Card', cardSchema);
