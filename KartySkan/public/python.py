from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import json

# Lista kart: (nazwa, url)
cards = [
    {
        "name": "Tony Tony Chopper",
        "url": "https://www.tcgplayer.com/product/288235/one-piece-card-game-starter-deck-1-straw-hat-crew-tony-tonychopper?page=1&Language=English"
    },
    {
        "name": "Kouzuki Oden",
        "url": "https://www.tcgplayer.com/product/544523/one-piece-card-game-extra-booster-memorial-collection-kouzuki-oden?Language=English&page=1"
    },
    {
        "name": "Nami",
        "url": "https://www.tcgplayer.com/product/288230/one-piece-card-game-starter-deck-1-straw-hat-crew-nami?page=1&Language=English"
    },
    # Dodaj więcej...
]

options = Options()
options.add_argument("--headless")
options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36")

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

results = []

for card in cards:
    try:
        driver.get(card["url"])
        time.sleep(5)

        try:
            price_element = driver.find_element(By.CLASS_NAME, "spotlight__price")
        except:
            # Alternatywna metoda, jeśli klasa się nie zgadza
            price_element = driver.find_element(By.CSS_SELECTOR, ".price-point__market-price .price")

        price = price_element.text.strip()
        print(f"{card['name']}: {price}")
        results.append({"name": card["name"], "price": price})

    except Exception as e:
        print(f"Błąd dla {card['name']}: {e}")
        results.append({"name": card["name"], "price": "Błąd"})

driver.quit()

# Zapisz wyniki do JSON
with open("all_prices.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)