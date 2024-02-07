document.addEventListener('DOMContentLoaded', function() {
    const searchBox = document.getElementById('search-box');
    const categorySelect = document.getElementById('category-select');
    const noRecipesMessage = document.getElementById('no-recipes');

    let recipes = [];

    // Load recipes from local storage
    if (localStorage.getItem('recipes')) {
        try {
            recipes = JSON.parse(localStorage.getItem('recipes'));
        } catch (error) {
            console.error('Error loading recipes from local storage:', error);
        }
    }

    // Display recipes
    displayRecipes();

    if (searchBox) {
        searchBox.addEventListener('input', handleSearch);
    }
    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategoryChange);
    }

    function handleCategoryChange(event) {
        const selectedCategory = event.target.value;
        const filteredRecipes = recipes.filter(recipe => recipe.category === selectedCategory);
        displayRecipes(filteredRecipes);
    }

    function handleSearch(event) {
        const query = event.target.value.trim().toLowerCase();
        const filteredRecipes = recipes.filter(recipe => {
            return recipe.name.toLowerCase().includes(query);
        });
        displayRecipes(filteredRecipes);
    }

    function displayRecipes(recipesToDisplay = recipes) {
        const recipeListContainer = document.getElementById('recipe-list');
        if (!recipeListContainer) {
            console.error('Recipe list container not found.');
            return;
        }
    
        recipeListContainer.innerHTML = '';
    
        if (recipesToDisplay.length === 0) {
            noRecipesMessage.style.display = 'block';
        } else {
            noRecipesMessage.style.display = 'none';
    
            recipesToDisplay.forEach(recipe => {
                const recipeDiv = document.createElement('div');
                recipeDiv.innerHTML = `
                    <h3>${recipe.name}</h3>
                    <p><strong>Category:</strong> ${recipe.category}</p>
                    <img src="${recipe.imageUrl}" alt="Recipe Image">
                    <p><strong>Ingredients:</strong></p>
                    <ul>
                        ${recipe.ingredients.map(ingr => `<li>${ingr}</li>`).join('')}
                    </ul>
                    <p><strong>Method:</strong></p>
                    <p>${recipe.method}</p>
    
                    <p id="average-rating-${recipe.id}">Average Rating: ${calculateAverageRating(recipe.id)}</p>
                    <button class="delete-button" data-id="${recipe.id}">Delete</button>
                    <button class="rate-button" data-id="${recipe.id}">Rate</button>
                    <button class="show-reviews-button" data-id="${recipe.id}">Show Reviews</button>
                    <button class="add-favorite-button" data-id="${recipe.id}">Add to Favorites</button>
                `;
                recipeDiv.classList.add('recipe');
                recipeListContainer.appendChild(recipeDiv);
            });
    
            const rateButtons = document.querySelectorAll('.rate-button');
            rateButtons.forEach(button => {
                button.addEventListener('click', handleRate);
            });
            const deleteButtons = document.querySelectorAll('.delete-button');
            deleteButtons.forEach(button => {
                button.addEventListener('click', handleDelete);
            });
            const showReviewsButtons = document.querySelectorAll('.show-reviews-button');
            showReviewsButtons.forEach(button => {
                button.addEventListener('click', handleShowReviews);
            });
            const addFavoriteButtons = document.querySelectorAll('.add-favorite-button');
            addFavoriteButtons.forEach(button => {
                button.addEventListener('click', handleAddFavorite);
            });
        }
    }
    
    
    function handleAddFavorite(event) {
        const recipeId = parseInt(event.target.dataset.id);
        const userEmail = sessionStorage.getItem('email');
        console.log('User Email:', userEmail); // Debug statement
    
        let favoriteRecipes = JSON.parse(localStorage.getItem(userEmail + '_favoriteRecipes')) || [];
        console.log('Current Favorite Recipes:', favoriteRecipes); // Debug statement
    
        if (!favoriteRecipes.includes(recipeId)) {
            favoriteRecipes.push(recipeId);
            localStorage.setItem(userEmail + '_favoriteRecipes', JSON.stringify(favoriteRecipes));
            console.log('Recipe added to favorites:', recipeId); // Debug statement
            alert('Recipe added to favorites!');
        } else {
            alert('Recipe is already in favorites!');
        }
    
        // Redirect to the favorite recipes page after adding to favorites
        window.location.href = 'favorite_recipes.html';
    }
    
    function handleShowReviews(event) {
        const recipeId = parseInt(event.target.dataset.id);
        window.location.href = `reviews.html?recipeId=${recipeId}`;
    }

    function handleRate(event) {
        const recipeId = parseInt(event.target.dataset.id);
        const userEmail = sessionStorage.getItem('email');
        const ratingsAndReviews = JSON.parse(localStorage.getItem('ratingsAndReviews')) || [];
    
        // Check if the user has already rated the recipe
        const userRating = ratingsAndReviews.find(item => item.recipeId === recipeId.toString() && item.userEmail === userEmail);
        if (userRating) {
            alert('You have already rated this recipe.');
        } else {
            console.log('Rate button clicked for Recipe ID:', recipeId); // Add this line for debugging
            window.location.href = `rate_review.html?recipeId=${recipeId}`;
        }
    }
    
    
    function handleDelete(event) {
        const recipeId = parseInt(event.target.dataset.id);
        recipes = recipes.filter(recipe => recipe.id !== recipeId);
        localStorage.setItem('recipes', JSON.stringify(recipes));
        displayRecipes();
    }

    function calculateAverageRating(recipeId) {
        const ratingsAndReviews = JSON.parse(localStorage.getItem('ratingsAndReviews')) || [];
        console.log('Ratings and Reviews:', ratingsAndReviews);
        
        const ratingsForRecipe = ratingsAndReviews.filter(item => item.recipeId === recipeId.toString());
        console.log('Ratings for Recipe', recipeId, ':', ratingsForRecipe);
    
        if (ratingsForRecipe.length === 0) {
            return 'No ratings yet';
        }
        
        const totalRating = ratingsForRecipe.reduce((acc, curr) => acc + parseInt(curr.rating), 0);
        const averageRating = totalRating / ratingsForRecipe.length;
        return averageRating.toFixed(1);
    }
});
    