const mongoose = require('mongoose');
require('dotenv').config();

// Połączenie z MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Połączono z MongoDB'))
  .catch(err => console.error('❌ Błąd połączenia z MongoDB:', err));

// Schemat kart
const CardSchema = new mongoose.Schema({
  cid: { type: String, required: true, unique: true },
  name: String,
  power: Number,
  cost: Number,
  counter: Number,
  type: String,
  effect_trigger: String,
  effect: String,
  traits: [String],
  attributes: [String],
  edition: String,
  rarity: String,
  image_url: String
});

const Card = mongoose.model('Card', CardSchema);

// Schemat użytkownika
const UserSchema = new mongoose.Schema({
  username: String,
  cards: {
    type: Map,
    of: Number,
    default: {}
  }
});

const User = mongoose.model('User', UserSchema);

// Funkcja przypisująca karty do użytkowników
async function assignCardsToUsers() {
  try {
    const cards = await Card.find({});
    const users = await User.find({});

    console.log(`Znaleziono ${cards.length} kart i ${users.length} użytkowników.`);

    for (const user of users) {
      let modified = false;

      for (const card of cards) {
        if (!user.cards.has(card.cid)) {
          user.cards.set(card.cid, 0); // ✅ tylko liczba
          modified = true;
        }
      }

      if (modified) {
        await user.save();
        console.log(`✅ Zaktualizowano użytkownika: ${user.username}`);
      } else {
        console.log(`ℹ️ Użytkownik ${user.username} już miał wszystkie karty`);
      }
    }

    console.log('🎉 Wszystko gotowe!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Błąd:', error);
    process.exit(1);
  }
}

// Start
assignCardsToUsers();
