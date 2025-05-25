const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cards: [{ type: String, required: true }],
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Loan', loanSchema);