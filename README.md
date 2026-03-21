# FitScan – Nutrition Tracker

A web app to scan barcodes, get nutrition facts, track daily meals, water intake, and see BMI & daily goals.

## Features

- Profile setup (height, weight, age, gender, activity level, goal)
- BMI calculation with visual scale
- Barcode scanning via Open Food Facts API
- Custom food entry (for items not found)
- Today’s summary (calories, protein, carbs, fats)
- Water intake tracker
- Dark mode toggle
- Persistent meal history (localStorage)


## Tech Stack

- HTML5, CSS3, JavaScript (ES6)
- Open Food Facts API (no key required)
- LocalStorage for persistence

## How to Run Locally

Clone the repo and open `index.html` in your browser, or use a local server:

```bash
git clone https://github.com/your-username/fitscan.git
cd fitscan
python -m http.server 8000  # or use any static server
