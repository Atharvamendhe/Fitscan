// User profile and daily goals
class UserProfile {
    constructor() {
        this.height = 0;
        this.weight = 0;
        this.age = 0;
        this.gender = 'male';
        this.activity = 1.55;
        this.goal = 'maintain';
        this.dailyCalories = 0;
        this.dailyProtein = 0;
        this.dailyCarbs = 0;
        this.dailyFats = 0;
        this.bmi = 0;
        this.bmiCategory = '';
    }

    calculateBMR() {
        if (this.gender === 'male') {
            return (10 * this.weight) + (6.25 * this.height) - (5 * this.age) + 5;
        } else {
            return (10 * this.weight) + (6.25 * this.height) - (5 * this.age) - 161;
        }
    }

    calculateBMI() {
        const heightInMeters = this.height / 100;
        this.bmi = this.weight / (heightInMeters * heightInMeters);
        this.bmi = Math.round(this.bmi * 10) / 10;

        if (this.bmi < 18.5) {
            this.bmiCategory = 'Underweight';
        } else if (this.bmi >= 18.5 && this.bmi < 25) {
            this.bmiCategory = 'Normal weight';
        } else if (this.bmi >= 25 && this.bmi < 30) {
            this.bmiCategory = 'Overweight';
        } else {
            this.bmiCategory = 'Obese';
        }
    }

    calculateDailyNeeds() {
        const bmr = this.calculateBMR();
        let tdee = bmr * this.activity;

        switch(this.goal) {
            case 'lose':
                tdee -= 500;
                break;
            case 'gain':
                tdee += 500;
                break;
        }

        this.dailyCalories = Math.round(tdee);
        this.dailyProtein = Math.round(this.weight * 2.2);
        this.dailyCarbs = Math.round(this.dailyCalories * 0.4 / 4);
        this.dailyFats = Math.round(this.dailyCalories * 0.3 / 9);

        this.calculateBMI();
        this.updateUI();
    }

    updateUI() {
        document.getElementById('dailyCalories').textContent = this.dailyCalories;
        document.getElementById('dailyProtein').textContent = this.dailyProtein;
        document.getElementById('dailyCarbs').textContent = this.dailyCarbs;
        document.getElementById('dailyFats').textContent = this.dailyFats;
        
        document.getElementById('bmiNumber').textContent = this.bmi;
        document.getElementById('bmiCategory').textContent = this.bmiCategory;

        let position = 0;
        if (this.bmi < 15) position = 0;
        else if (this.bmi > 35) position = 100;
        else position = ((this.bmi - 15) / 20) * 100;
        document.getElementById('bmiMarker').style.left = position + '%';

        document.getElementById('dailyGoals').classList.remove('hidden');
    }
}

// Meal tracking for today's summary
class MealTracker {
    constructor() {
        this.totalCalories = 0;
        this.totalProtein = 0;
        this.totalCarbs = 0;
        this.totalFats = 0;
        this.waterIntake = 0;
    }

    addFood(food) {
        this.totalCalories += food.calories;
        this.totalProtein += food.protein;
        this.totalCarbs += food.carbs;
        this.totalFats += food.fats;
        this.updateSummary();
    }

    updateSummary() {
        document.getElementById('totalCalories').textContent = this.totalCalories;
        document.getElementById('totalProtein').textContent = this.totalProtein;
        document.getElementById('totalCarbs').textContent = this.totalCarbs;
        document.getElementById('totalFats').textContent = this.totalFats;
    }

    addWater(amount = 0.25) {
        this.waterIntake += amount;
        const percentage = (this.waterIntake / 2.5) * 100;
        document.querySelector('.water-bar').style.width = `${Math.min(percentage, 100)}%`;
        document.querySelector('.water-progress span').textContent = 
            `${this.waterIntake.toFixed(1)}L / 2.5L`;
    }
}

// Meal History (persistent storage)
class MealHistory {
    constructor() {
        this.history = [];
        this.loadHistory();
    }

    loadHistory() {
        const stored = localStorage.getItem('mealHistory');
        if (stored) {
            this.history = JSON.parse(stored);
        }
        this.renderHistory();
    }

    saveHistory() {
        localStorage.setItem('mealHistory', JSON.stringify(this.history));
    }

    addEntry(food) {
        const entry = {
            id: Date.now(),
            name: food.name,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fats: food.fats,
            fiber: food.fiber,
            date: new Date().toLocaleString()
        };
        this.history.unshift(entry); // newest first
        this.saveHistory();
        this.renderHistory();
    }

    removeEntry(id) {
        this.history = this.history.filter(entry => entry.id !== id);
        this.saveHistory();
        this.renderHistory();
    }

    clearAll() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        const container = document.getElementById('historyList');
        if (!container) return;

        if (this.history.length === 0) {
            container.innerHTML = '<p class="empty-history">No meals added yet. Scan or add a food to see it here.</p>';
            return;
        }

        container.innerHTML = this.history.map(entry => `
            <div class="history-item" data-id="${entry.id}">
                <div class="history-info">
                    <strong>${escapeHtml(entry.name)}</strong>
                    <span class="history-calories">${entry.calories} kcal</span>
                    <small class="history-date">${escapeHtml(entry.date)}</small>
                </div>
                <div class="history-macros">
                    <span>P: ${entry.protein}g</span>
                    <span>C: ${entry.carbs}g</span>
                    <span>F: ${entry.fats}g</span>
                </div>
                <button class="remove-history" onclick="window.removeHistoryEntry(${entry.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
}

// Helper to escape HTML
function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// Initialize global objects
const userProfile = new UserProfile();
const mealTracker = new MealTracker();
const mealHistory = new MealHistory();

// Make functions globally accessible
window.addWater = function() {
    mealTracker.addWater();
};

window.removeHistoryEntry = function(id) {
    if (confirm('Remove this entry from history?')) {
        mealHistory.removeEntry(id);
    }
};

window.clearHistory = function() {
    if (confirm('Clear all history? This cannot be undone.')) {
        mealHistory.clearAll();
    }
};

// Event listener for profile form
document.getElementById('userProfileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    userProfile.height = parseFloat(document.getElementById('height').value);
    userProfile.weight = parseFloat(document.getElementById('weight').value);
    userProfile.age = parseFloat(document.getElementById('age').value);
    userProfile.gender = document.getElementById('gender').value;
    userProfile.activity = parseFloat(document.getElementById('activity').value);
    userProfile.goal = document.getElementById('goal').value;
    
    userProfile.calculateDailyNeeds();
});