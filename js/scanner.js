// scanner.js - Barcode + Custom Food with History integration

const OPENFOODFACTS_API = 'https://world.openfoodfacts.org/api/v2';

// ========== API FUNCTIONS ==========
async function searchByBarcode(barcode) {
    try {
        const response = await fetch(`${OPENFOODFACTS_API}/product/${barcode}.json`);
        const data = await response.json();
        
        if (data.status === 1) {
            return formatProductData(data.product);
        }
        return null;
    } catch (error) {
        console.error('Barcode search error:', error);
        return null;
    }
}

function formatProductData(product) {
    const nutriments = product.nutriments || {};
    return {
        name: product.product_name || 'Unknown Food',
        calories: Math.round(nutriments['energy-kcal'] || nutriments['energy-kcal_value'] || 0),
        protein: Math.round(nutriments.proteins || nutriments.proteins_value || 0),
        carbs: Math.round(nutriments.carbohydrates || nutriments.carbohydrates_value || 0),
        fats: Math.round(nutriments.fat || nutriments.fat_value || 0),
        fiber: Math.round(nutriments.fiber || nutriments.fiber_value || 0),
        serving: product.serving_size || 'per 100g',
    };
}

// ========== BARCODE HANDLING ==========
async function searchByBarcodeInput() {
    const barcode = document.getElementById('barcodeInput').value.trim();
    if (!barcode) {
        alert('Please enter a barcode');
        return;
    }
    
    const searchBtn = document.querySelector('.btn-primary');
    const originalText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
    searchBtn.disabled = true;
    
    const foodData = await searchByBarcode(barcode);
    
    if (foodData) {
        displayFoodResult(foodData);
    } else {
        alert('Product not found for this barcode. Please check the number or try custom entry.');
    }
    
    searchBtn.innerHTML = originalText;
    searchBtn.disabled = false;
}

// ========== CUSTOM FOOD HANDLING ==========
function toggleCustomForm() {
    const form = document.getElementById('customFoodForm');
    const toggleBtn = document.getElementById('customToggle');
    form.classList.toggle('hidden');
    if (form.classList.contains('hidden')) {
        toggleBtn.innerHTML = '<i class="fas fa-pen"></i> Can\'t find barcode? Enter custom food';
    } else {
        toggleBtn.innerHTML = '<i class="fas fa-times"></i> Hide custom form';
    }
}

function addCustomFood() {
    const name = document.getElementById('customName').value.trim();
    const calories = parseFloat(document.getElementById('customCalories').value) || 0;
    const protein = parseFloat(document.getElementById('customProtein').value) || 0;
    const carbs = parseFloat(document.getElementById('customCarbs').value) || 0;
    const fats = parseFloat(document.getElementById('customFats').value) || 0;
    const fiber = parseFloat(document.getElementById('customFiber').value) || 0;

    if (!name) {
        alert('Please enter a food name');
        return;
    }
    if (calories <= 0 && protein <= 0 && carbs <= 0 && fats <= 0) {
        alert('Please enter at least one nutrient value');
        return;
    }

    const customFood = {
        name: name,
        calories: calories,
        protein: protein,
        carbs: carbs,
        fats: fats,
        fiber: fiber,
        serving: 'custom serving'
    };

    displayFoodResult(customFood);
    
    // Hide the form and reset fields
    document.getElementById('customFoodForm').classList.add('hidden');
    document.getElementById('customToggle').innerHTML = '<i class="fas fa-pen"></i> Can\'t find barcode? Enter custom food';
    document.getElementById('customName').value = '';
    document.getElementById('customCalories').value = '';
    document.getElementById('customProtein').value = '';
    document.getElementById('customCarbs').value = '';
    document.getElementById('customFats').value = '';
    document.getElementById('customFiber').value = '';
}

// ========== DISPLAY & UTILITIES ==========
function displayFoodResult(food) {
    document.getElementById('foodName').textContent = food.name;
    document.getElementById('foodCalories').textContent = food.calories;
    document.getElementById('foodProtein').textContent = food.protein + 'g';
    document.getElementById('foodCarbs').textContent = food.carbs + 'g';
    document.getElementById('foodFats').textContent = food.fats + 'g';
    document.getElementById('foodFiber').textContent = (food.fiber || 0) + 'g';
    
    let caloriePercent;
    if (typeof userProfile !== 'undefined' && userProfile.dailyCalories > 0) {
        caloriePercent = (food.calories / userProfile.dailyCalories) * 100;
        document.getElementById('calorieProgress').style.width = `${Math.min(caloriePercent, 100)}%`;
    } else {
        caloriePercent = (food.calories / 2000) * 100;
        document.getElementById('calorieProgress').style.width = `${Math.min(caloriePercent, 100)}%`;
    }
    
    // Update circular chart
    const percent = Math.min(caloriePercent, 100);
    document.getElementById('calorieCircle').setAttribute('stroke-dasharray', `${percent}, 100`);
    document.getElementById('caloriePercentage').textContent = Math.round(percent) + '%';
    
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    
    if (typeof generateRecommendation === 'function') {
        generateRecommendation(food);
    }
}

function addToMeal() {
    const food = {
        name: document.getElementById('foodName').textContent,
        calories: parseInt(document.getElementById('foodCalories').textContent),
        protein: parseFloat(document.getElementById('foodProtein').textContent),
        carbs: parseFloat(document.getElementById('foodCarbs').textContent),
        fats: parseFloat(document.getElementById('foodFats').textContent),
        fiber: parseFloat(document.getElementById('foodFiber').textContent)
    };
    
    if (typeof mealTracker !== 'undefined') {
        mealTracker.addFood(food);
        if (typeof mealHistory !== 'undefined') {
            mealHistory.addEntry(food);
        }
        alert(`${food.name} added to today's meal and history!`);
    } else {
        alert('Meal tracker not initialized');
    }
}

function scanAnother() {
    document.getElementById('results').classList.add('hidden');
    document.getElementById('barcodeInput').value = '';
    document.getElementById('calorieCircle').setAttribute('stroke-dasharray', '0,100');
    document.getElementById('caloriePercentage').textContent = '0%';
    
    // Hide custom form if visible
    const form = document.getElementById('customFoodForm');
    if (!form.classList.contains('hidden')) {
        form.classList.add('hidden');
        document.getElementById('customToggle').innerHTML = '<i class="fas fa-pen"></i> Can\'t find barcode? Enter custom food';
    }
}