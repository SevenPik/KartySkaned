const mongoose = require('mongoose');

// Zdefiniowanie schematu użytkownika
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    }
});

// Tworzenie modelu użytkownika na podstawie schematu
const User = mongoose.model('User', userSchema);

module.exports = User;