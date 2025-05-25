const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); // <--- Dodane do konwersji ObjectId

// middleware autoryzacji
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

// POST /api/loan
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('REQ.BODY (POST /api/loan):', req.body);
    const { from, to, cards } = req.body;

    if (!from || !to || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ message: 'Nieprawidłowe dane wejściowe.' });
    }

    if (from === to) {
      return res.status(400).json({ message: 'Nie można pożyczyć kart samemu sobie.' });
    }

    const fromUser = await User.findById(from);
    const toUser = await User.findById(to);

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
    }

    const loan = new Loan({ from, to, cards });
    await loan.save();

    console.log('ZAPISANO POŁĄCZENIE:', loan);

    res.status(201).json({ message: 'Połączenie zapisane.', loan });
  } catch (err) {
    console.error('BŁĄD SERWERA (POST /api/loan):', err);
    res.status(500).json({ message: 'Błąd serwera.' });
  }
});

// GET /api/loan/connections - lista połączeń z udziałem zalogowanego użytkownika
router.get('/connections', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id); // ✅ KONWERSJA

    console.log('REQ.USER.ID (GET /api/loan/connections):', userId);

    const loans = await Loan.find({
      $or: [{ from: userId }, { to: userId }]
    })
      .populate('from', 'email displayName _id')
      .populate('to', 'email displayName _id')
      .lean();

    console.log('ZNALEZIONE POŁĄCZENIA:', loans.length);

    const connections = loans.map(loan => ({
      from: {
        id: loan.from._id,
        email: loan.from.email,
        displayName: loan.from.displayName
      },
      to: {
        id: loan.to._id,
        email: loan.to.email,
        displayName: loan.to.displayName
      },
      cards: loan.cards,
      date: loan.date
    }));

    res.json(connections);
  } catch (err) {
    console.error('BŁĄD POBIERANIA POŁĄCZEŃ:', err);
    res.status(500).json({ message: 'Błąd pobierania połączeń' });
  }
});

module.exports = router;
