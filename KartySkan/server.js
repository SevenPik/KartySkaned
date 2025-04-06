require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const User = require('./models/User');
const Card = require('./models/Card');
const UserCard = require('./models/UserCard');

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
    const user = new User({ email, password: hashedPassword });
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
    const userCards = await UserCard.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $lookup: {
          from: 'cards',
          localField: 'cardId',
          foreignField: '_id',
          as: 'cardData'
        }
      },
      { $unwind: '$cardData' },
      {
        $project: {
          _id: 0,
          cardId: '$cardId',
          count: '$count',
          name: '$cardData.name',
          image: '$cardData.image'
        }
      }
    ]);

    res.json(userCards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd pobierania kart użytkownika' });
  }
});

// Dodawanie nowej karty
app.post('/add-card', authenticateToken, async (req, res) => {
  const { name, rarity, description, image, count, userId } = req.body;

  try {
    let card = await Card.findOne({ name });

    if (!card) {
      card = new Card({ name, rarity, description, image });
      await card.save();
    }

    let userCard = await UserCard.findOne({ userId, cardId: card._id });

    if (userCard) {
      userCard.count += count;
    } else {
      userCard = new UserCard({ userId, cardId: card._id, count });
    }

    await userCard.save();

    res.status(201).json({ message: 'Karta dodana' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd dodawania karty' });
  }
});

// Aktualizacja ilości kart
app.patch('/update-card/:id', authenticateToken, async (req, res) => {
  const { count } = req.body;
  const cardId = req.params.id;

  try {
    const result = await UserCard.findOneAndUpdate(
      { userId: req.user.id, cardId },
      { count },
      { new: true }
    );

    if (!result) return res.status(404).json({ message: 'Nie znaleziono karty użytkownika' });

    res.json({ message: 'Ilość zaktualizowana', card: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd aktualizacji' });
  }
});

// Serwowanie index.html jako fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mainpage.html'));
});

// Start serwera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
