require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const User = require('./models/User');
const Card = require('./models/Card');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Połączenie z MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Połączono z MongoDB'))
.catch(err => console.error('Błąd połączenia z MongoDB:', err));

// Middleware do autoryzacji
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Rejestracja użytkownika
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, cards: [] });
    await user.save();
    res.status(201).json({ message: 'Użytkownik zarejestrowany' });
  } catch (err) {
    res.status(400).json({ message: 'Błąd rejestracji' });
  }
});

// Logowanie użytkownika
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Nieprawidłowy email lub hasło' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user._id, email, displayName: email.split('@')[0] } });
});

// Pobieranie kart użytkownika
app.get('/api/user-cards', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user || !user.cards) return res.json([]);

    const cids = user.cards.map(c => c.cid);
    const allCards = await Card.find({ cid: { $in: cids } }).lean();

    const mergedCards = user.cards.map(userCard => {
      const cardData = allCards.find(c => c.cid === userCard.cid);
      return {
        cid: userCard.cid,
        count: userCard.count,
        name: cardData?.name || 'Nieznana karta',
        power: cardData?.power,
        cost: cardData?.cost,
        counter: cardData?.counter,
        type: cardData?.type,
        effect: cardData?.effect,
        effect_trigger: cardData?.effect_trigger,
        rarity: cardData?.rarity,
        edition: cardData?.edition,
        image_url: cardData?.image_url
      };
    });

    res.json(mergedCards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd pobierania kart użytkownika' });
  }
});

// Dodawanie nowej karty użytkownikowi
app.post('/add-card', authenticateToken, async (req, res) => {
  const { cid, count } = req.body;

  try {
    const card = await Card.findOne({ cid });
    if (!card) return res.status(404).json({ message: 'Nie znaleziono karty o podanym CID' });

    const user = await User.findById(req.user.id);
    const existing = user.cards.find(c => c.cid === cid);
    if (existing) {
      existing.count += count;
    } else {
      user.cards.push({ cid, count });
    }

    await user.save();
    res.status(201).json({ message: 'Karta dodana' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd dodawania karty' });
  }
});

// Aktualizacja ilości kart użytkownika
app.patch('/update-card/:cid', authenticateToken, async (req, res) => {
  const { count } = req.body;
  const { cid } = req.params;

  try {
    const user = await User.findById(req.user.id);
    const card = user.cards.find(c => c.cid === cid);
    if (!card) return res.status(404).json({ message: 'Karta nie znaleziona' });

    card.count = count;
    await user.save();

    res.json({ message: 'Ilość zaktualizowana', cid, count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd aktualizacji ilości' });
  }
});

// Serwowanie strony głównej
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mainpage.html'));
});

// Start serwera
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
