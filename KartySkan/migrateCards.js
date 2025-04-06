require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
}).then(() => console.log("✅ Połączono z MongoDB"))
  .catch(err => console.error("❌ Błąd połączenia:", err));

const cardSchema = new mongoose.Schema({
  name: String,
  rarity: String,
  description: String,
  image: String
});

const userCardSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  cardId: mongoose.Schema.Types.ObjectId,
  count: { type: Number, default: 0 }
});

const Card = mongoose.model('Card', cardSchema, 'cards');
const UserCard = mongoose.model('UserCard', userCardSchema, 'usercards');

const migrateCardsForUser = async (userId) => {
  try {
    const allCards = await Card.find();
    for (const card of allCards) {
      const existing = await UserCard.findOne({ userId, cardId: card._id });
      if (!existing) {
        await UserCard.create({
          userId,
          cardId: card._id,
          count: 0
        });
        console.log(`✅ Przeniesiono kartę ${card.name} do usercards.`);
      } else {
        console.log(`ℹ️ Karta ${card.name} już istnieje dla tego użytkownika.`);
      }
    }
    console.log("🎉 Migracja zakończona");
  } catch (err) {
    console.error("❌ Błąd migracji:", err);
  } finally {
    mongoose.disconnect();
  }
};

// 🔁 Podaj tutaj ID użytkownika:
const userId = '67e99fc9fb82ee8e034e1bcc';
migrateCardsForUser(userId);
