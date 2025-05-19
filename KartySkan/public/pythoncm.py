from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import json

# Lista kart: (nazwa, url Cardmarket)
cards = [
 
  {
    "name": "Kozuki Hiyori",
    "url": "https://www.cardmarket.com/en/OnePiece/Products/Singles/Memorial-Collection/Kouzuki-Hiyori-EB01-013-V1"
  },
  {
    "name": "Cavendish",
    "url": "https://www.cardmarket.com/en/OnePiece/Products/Singles/Memorial-Collection/Cavendish-EB01-012-V1"
  },
  {
    "name": "Tony Tony Chopper",
    "url": "https://www.cardmarket.com/en/OnePiece/Products/Singles/Memorial-Collection/Tony-TonyChopper-EB01-006-V1"
  },
  {
    "name": "Kouzuki Oden",
    "url": "https://www.cardmarket.com/en/OnePiece/Products/Singles/Memorial-Collection/Kouzuki-Oden-EB01-001-V1"
  },
  {
    "name": "Koza",
    "url": "https://www.cardmarket.com/en/OnePiece/Products/Singles/Memorial-Collection/Koza-EB01-004"
  },
  {
    "name": "Blueno",
    "url": "https://www.cardmarket.com/en/OnePiece/Products/Singles/Memorial-Collection/Blueno-EB01-017"
  },
  {
    "name": "Hannyabal",
    "url": "https://www.cardmarket.com/en/OnePiece/Products/Singles/Memorial-Collection/Hannyabal-EB01-021-V1"
  },
  {
    "name": "Edward Weevil",
    "url": "https://www.cardmarket.com/en/OnePiece/Products/Singles/Memorial-Collection/Edward-Weevil-EB01-023"
  },
  {
    "name": "Inazuma",
    "url": "https://www.cardmarket.com/en/OnePiece/Products/Singles/Memorial-Collection/Inazuma-EB01-022-V1"
  }


    # Dodaj więcej kart według potrzeby
]

# Konfiguracja przeglądarki
options = Options()
options.add_argument("--headless")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36")

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

results = []

for card in cards:
    try:
        driver.get(card["url"])
        time.sleep(1)  # Poczekaj na załadowanie strony

        # Szukamy pola "Lowest Price"
        dt_elements = driver.find_elements(By.TAG_NAME, "dt")
        price_cm = "Not found"

        for dt in dt_elements:
            if dt.text.strip() == "From":
                dd = dt.find_element(By.XPATH, "following-sibling::dd[1]")
                price_cm = dd.text.strip()
                break

        print(f"{card['name']}: {price_cm}")
        results.append({
            "name": card["name"],
            "price_cm": price_cm
        })

    except Exception as e:
        print(f"Błąd dla {card['name']}: {e}")
        results.append({
            "name": card["name"],
            "price_cm": "Błąd"
        })

driver.quit()

# Zapisz dane do pliku JSON
with open("all_prices_cardmarket.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
