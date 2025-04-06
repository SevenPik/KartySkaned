require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');
const path = require('path');

const User = require('./models/User');

const serviceAccount = require('./admin-sdk.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(cors());
app.use(express.json());

// 📌 Serwowanie plików statycznych
app.use(express.static(__dirname));

// 📡 Połączenie z MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('🟢 Połączono z MongoDB'))
    .catch(err => console.error('🔴 Błąd połączenia z MongoDB:', err));

// 📌 Główne trasy HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/mainpage.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'mainpage.html'));
});

// 🔹 Rejestracja
app.post('/register', async (req, res) => {
    const { email, password, displayName } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Użytkownik już istnieje' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, displayName });
        await newUser.save();

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ 
            message: 'Użytkownik zarejestrowany',
            token,
            user: { email: newUser.email, displayName: newUser.displayName }
        });
    } catch (error) {
        res.status(500).json({ error: 'Błąd rejestracji' });
    }
});

// 🔹 Logowanie
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ 
            message: 'Zalogowano pomyślnie',
            token,
            user: { email: user.email, displayName: user.displayName }
        });
    } catch (error) {
        res.status(500).json({ error: 'Błąd logowania' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serwer działa na porcie ${PORT}`));
