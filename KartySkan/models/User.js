const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  displayName: String,
  email: String,
  password: String
});

module.exports = mongoose.model('User', userSchema);
