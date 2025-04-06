require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const User = require('./models/User');
const Card = require('./models/Card');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🔗 Połączenie z MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('🟢 Połączono z MongoDB'))
.catch(err => console.error('🔴 Błąd połączenia z MongoDB:', err));

// 📄 Serwowanie HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/mainpage.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'mainpage.html'));
});

// 🔐 Rejestracja
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
      user: { email: newUser.email, displayName: newUser.displayName, _id: newUser._id }
    });
  } catch (error) {
    res.status(500).json({ error: 'Błąd rejestracji' });
  }
});

// 🔐 Logowanie
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
      user: { email: user.email, displayName: user.displayName, _id: user._id }
    });
  } catch (error) {
    res.status(500).json({ error: 'Błąd logowania' });
  }
});

// 🃏 Dodaj kartę
app.post('/add-card', async (req, res) => {
  try {
    const { name, rarity, description, image, count, userId } = req.body;
    const card = new Card({
      name,
      rarity,
      description,
      image,
      count,
      ownerId: userId
    });
    await card.save();
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ error: 'Błąd dodawania karty' });
  }
});

// 📥 Pobierz karty użytkownika
app.get('/my-cards/:userId', async (req, res) => {
  try {
    const cards = await Card.find({ ownerId: req.params.userId });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: 'Błąd pobierania kart' });
  }
});

// 🔁 Aktualizacja liczby kart
app.patch('/update-card/:id', async (req, res) => {
  try {
    const { count } = req.body;
    const updatedCard = await Card.findByIdAndUpdate(
      req.params.id,
      { count },
      { new: true }
    );
    res.json(updatedCard);
  } catch (err) {
    res.status(500).json({ error: 'Błąd aktualizacji liczby kart' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serwer działa na porcie ${PORT}`));
