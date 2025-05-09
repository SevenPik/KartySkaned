const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  cid: { type: String, required: true, unique: true },
  name: String,
  power: Number,
  cost: Number,
  counter: Number,
  type: String,
  effect_trigger: String,
  effect: String,
  traits: [String],
  attributes: [String],
  edition: String,
  rarity: String,
  image_url: String
});

module.exports = mongoose.model('Card', CardSchema);
