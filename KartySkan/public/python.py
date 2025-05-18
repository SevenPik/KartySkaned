from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time

url = "https://www.tcgplayer.com/product/288235/one-piece-card-game-starter-deck-1-straw-hat-crew-tony-tonychopper?page=1&Language=English"

options = Options()
options.add_argument("--headless")
options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36")

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

try:
    driver.get(url)
    time.sleep(5)
    price_element = driver.find_element(By.CLASS_NAME, "spotlight__price")
   

    price = price_element.text.strip()

    with open("chopper_price.txt", "w", encoding="utf-8") as f:
        f.write(price)

    print(f"Cena karty: {price}")

except Exception as e:
    print("Błąd:", e)

finally:
    driver.quit()