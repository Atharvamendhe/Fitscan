function generateRecommendation(food) {
    const recommendationBox = document.getElementById('recommendationText');
    const userGoal = document.getElementById('goal').value;
    
    let recommendation = '';
    
    if (food.protein > 20) {
        recommendation += '💪 High in protein! ';
        if (userGoal === 'gain') {
            recommendation += 'Great for muscle building. ';
        }
    }
    
    if (food.fiber > 5) {
        recommendation += '🌱 Excellent source of fiber. ';
        recommendation += 'Helps with digestion and keeps you full longer. ';
    }
    
    if (food.fats > 20) {
        recommendation += '⚠️ High in fats. ';
        if (userGoal === 'lose') {
            recommendation += 'Consider smaller portions. ';
        }
    }
    
    if (food.calories < 100) {
        recommendation += '✅ Low-calorie option. ';
        if (userGoal === 'lose') {
            recommendation += 'Great for snacking! ';
        }
    }
    
    if (userGoal === 'lose') {
        if (food.calories < 200) {
            recommendation += 'This fits well in your weight loss plan. ';
        }
    } else if (userGoal === 'gain') {
        if (food.calories > 300 || food.protein > 15) {
            recommendation += 'Good choice for your muscle gain goals! ';
        }
    }
    
    if (!recommendation) {
        recommendation = `This ${food.name} provides ${food.calories} calories. `;
        recommendation += `It's a good source of energy and nutrients. `;
        recommendation += `Consider pairing it with other foods for a balanced meal.`;
    }
    
    recommendationBox.textContent = recommendation;
}