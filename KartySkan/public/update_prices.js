const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const fs = require('fs');
const User = require('../models/User'); // Ścieżka względna do modelu

async function updatePrices() {
  try {
    console.log('🔧 MONGO_URI:', process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Połączono z MongoDB');

    const users = await User.find({});
    console.log(`👥 Znaleziono ${users.length} użytkowników`);

    const pricesPath = path.join(__dirname, 'all_prices.json');
    const pricesData = JSON.parse(fs.readFileSync(pricesPath, 'utf8'));

    // Mapa: cid.toLowerCase() => cena
    const priceMap = {};
    pricesData.forEach(p => {
      if (p.cid && p.price) {
        priceMap[p.cid.toLowerCase()] = parseFloat(p.price.replace('$', ''));
      }
    });

    for (const user of users) {
      let totalValue = 0;

      user.cards?.forEach(card => {
        const key = card.cid.toLowerCase();
        const count = card.count || 1;
        const cardPrice = priceMap[key];

        if (cardPrice) {
          totalValue += cardPrice * count;
        }
      });

      // Dodaj historię cenową
      if (!user.priceHistory) user.priceHistory = [];
      user.priceHistory.push({
        date: new Date(),
        value: parseFloat(totalValue.toFixed(2))
      });

      await user.save();
      console.log(`💾 Zaktualizowano użytkownika: ${user.email}, suma: $${totalValue.toFixed(2)}`);
    }

  } catch (err) {
    console.error('❌ Błąd:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Rozłączono z MongoDB');
  }
}

updatePrices();
