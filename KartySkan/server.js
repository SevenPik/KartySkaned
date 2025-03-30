require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');
const path = require('path');

// Import modelu użytkownika
const User = require('./models/User');

// Inicjalizacja Firebase Admin
const serviceAccount = require('./admin-sdk.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Inicjalizacja Express
const app = express();
app.use(cors());
app.use(express.json());

// 📌 Serwowanie plików statycznych (HTML, CSS, JS, obrazy)
app.use(express.static(__dirname));

// 📡 Połączenie z MongoDB
console.log('📡 Mongo URI:', process.env.MONGO_URI); // Debugowanie zmiennej środowiskowej
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('🟢 Połączono z MongoDB'))
    .catch(err => console.error('🔴 Błąd połączenia z MongoDB:', err));

// 📌 Obsługa głównej strony (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 🔹 Rejestracja użytkownika
app.post('/register', async (req, res) => {
    const { email, password, displayName } = req.body;

    try {
        console.log('➡ Próba rejestracji:', { email, displayName });

        // Sprawdzenie, czy użytkownik już istnieje
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('⚠ Użytkownik już istnieje:', email);
            return res.status(400).json({ error: 'Użytkownik już istnieje' });
        }

        // Haszowanie hasła
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Tworzenie nowego użytkownika
        const newUser = new User({ email, password: hashedPassword, displayName });
        await newUser.save();

        // Generowanie tokena JWT
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log('✅ Użytkownik zarejestrowany:', newUser);

        res.status(201).json({ 
            message: 'Użytkownik zarejestrowany',
            token,
            user: { email: newUser.email, displayName: newUser.displayName }
        });
    } catch (error) {
        console.error('❌ Błąd rejestracji:', error); // Wyświetlenie błędu w terminalu
        res.status(500).json({ error: 'Błąd rejestracji' });
    }
});

// 🔹 Logowanie użytkownika
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('➡ Próba logowania:', email);

        const user = await User.findOne({ email });
        if (!user) {
            console.log('⚠ Nie znaleziono użytkownika:', email);
            return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('⚠ Nieprawidłowe hasło dla:', email);
            return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log('✅ Zalogowano pomyślnie:', email);

        res.json({ 
            message: 'Zalogowano pomyślnie',
            token,
            user: { email: user.email, displayName: user.displayName }
        });
    } catch (error) {
        console.error('❌ Błąd logowania:', error);
        res.status(500).json({ error: 'Błąd logowania' });
    }
});

// Uruchomienie serwera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serwer działa na porcie ${PORT}`));
