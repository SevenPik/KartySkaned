const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cards: [
    {
      cid: { type: String, required: true },
      count: { type: Number, required: true, default: 1 }
    }
  ]
});

module.exports = mongoose.model('User', UserSchema);
