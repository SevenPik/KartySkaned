const mongoose = require('mongoose');

const userCardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
  count: Number
});

module.exports = mongoose.model('UserCard', userCardSchema);
