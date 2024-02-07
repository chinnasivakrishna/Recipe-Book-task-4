document.addEventListener('DOMContentLoaded', function() {

    const form = document.querySelector('#recipe-form');
    const searchBox = document.getElementById('search-box');
    const categorySelect = document.getElementById('category-select');
    let recipes = [];
    const recipeListContainer = document.getElementById('recipe-list');
    const noRecipesMessage = document.getElementById('no-recipes');
    let recipeIdCounter = 0;

    // Load recipes from local storage
    if (localStorage.getItem('recipes')) {
        try {
            recipes = JSON.parse(localStorage.getItem('recipes'));
            recipes.forEach((recipe, index) => {
                if (!('id' in recipe) || typeof recipe.id !== 'number') {
                    recipe.id = recipeIdCounter++;
                } else {
                    recipeIdCounter = Math.max(recipeIdCounter, recipe.id + 1);
                }
            });
        } catch (error) {
            console.error('Error loading recipes from local storage:', error);
        }
    }

    // Display recipes
    displayRecipes();

    if (form) {
        form.addEventListener('submit', handleSubmit);
    }

    if (searchBox) {
        searchBox.addEventListener('input', handleSearch);
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategoryChange);
    }
    if (recipeListContainer) {
        recipeListContainer.addEventListener('click', function(event) {
            if (event.target.classList.contains('edit-button')) {
                handleEdit(event);
            } else if (event.target.classList.contains('delete-button')) {
                handleDelete(event);
            } else if (event.target.classList.contains('share-button')) {
                shareRecipe(event);
            }
        });
    }
    const showMyRecipesButton = document.getElementById('show-recipes-btn');
    if (showMyRecipesButton) {
        showMyRecipesButton.addEventListener('click', function() {
            const userEmail = sessionStorage.getItem('email');
            if (userEmail) {
                const userRecipes = recipes.filter(recipe => recipe.userEmail === userEmail);
                displayRecipes(userRecipes, true); // Pass true to indicate showing user's recipes
            }
        });
    }

    function handleSubmit(event) {
        event.preventDefault();

        const nameInput = document.querySelector('#recipe-name');
        const imageInput = document.querySelector('#recipe-image');
        const ingrInput = document.querySelector('#recipe-ingredients');
        const methodInput = document.querySelector('#recipe-method');
        const categorySelect = document.querySelector('#category-select');

        const name = nameInput.value.trim();
        const imageUrl = imageInput.value.trim();
        const ingredients = ingrInput.value.trim().split(',').map(i => i.trim());
        const method = methodInput.value.trim();
        const category = categorySelect.value.trim();
        const userEmail = sessionStorage.getItem('email');

        if (name && imageUrl && ingredients.length > 0 && method && category && userEmail) {
            const newRecipe = {
                id: recipeIdCounter++,
                name,
                imageUrl,
                ingredients,
                method,
                category,
                userEmail,
                ratings: []
            };
            
            recipes.push(newRecipe);
            nameInput.value = '';
            imageInput.value = '';
            ingrInput.value = '';
            methodInput.value = '';

            localStorage.setItem('recipes', JSON.stringify(recipes));
            
            displayRecipes();

            console.log('Your recipe has been added! Recipe ID:', newRecipe.id);
            localStorage.setItem('recipess', newRecipe.id);
            window.location.href = 'display_recipes.html';
        }
    }


    function handleCategoryChange(event) {
        const selectedCategory = event.target.value;
        if(selectedCategory === "All"){
            displayRecipes();
        }
        else{
            const filteredRecipes = recipes.filter(recipe => recipe.category === selectedCategory);
            displayRecipes(filteredRecipes);
        }
    }

    function handleSearch(event) {
        const query = event.target.value.trim();
        const filteredRecipes = recipes.filter(recipe => {
            return recipe.name.includes(query);
        });
        displayRecipes(filteredRecipes);
    }

    function displayRecipes(recipesToDisplay = recipes, showDeleteButton = false) {
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
                recipeDiv.classList.add('recipe');
                recipeDiv.style.maxHeight = '550px';

                recipeDiv.innerHTML = `
                    <h2>${recipe.name}</h2>
                    <img src="${recipe.imageUrl}" alt="Recipe Image">
                    <p><strong>Ingredients:</strong></p>
                    <ul><span class='ingredients'>
                        ${recipe.ingredients.map((ingr, index) => index < 1 ? `<li>${ingr}</li>` : '').join('')}
                        ${recipe.ingredients.length > 1 ? "" : ''}
                        </span></ul>
                    <p><strong>Method:</strong></p><span class='method'>
                    ${recipe.method.split('\n').map((step, index) => index < 1 ? `<p>${step}</p>` : '').join('')}
                    ${recipe.method.split('\n').length > 1 ? '<p><a href="" class="show-more">Show More</a></p>' : ''}</span>
                    <p id="average-rating-${recipe.id}">Average Rating: ${calculateAverageRating(recipe.id)}</p>
                    <div class="interaction-buttons">
                        ${showDeleteButton ? `<button class="delete-button" data-id="${recipe.id}">Delete</button>` : ''}
                        <button class="rate-button" data-id="${recipe.id}">Rate</button>
                        <button class="show-reviews-button" data-id="${recipe.id}">Reviews</button>
                        <button class="add-favorite-button" data-id="${recipe.id}">Add Favorites</button>
                        ${showDeleteButton ? `<button class="edit-button" data-id="${recipe.id}">Edit</button>` : ''}
                        <button class="print-button">Print</button>
                        <button class="share-button" data-id="${recipe.id}">Share</button>
                    </div>
                `;

                recipeListContainer.appendChild(recipeDiv);
                
                const showMoreLinks = recipeDiv.querySelectorAll('.show-more');
                showMoreLinks.forEach(link => {
                    link.addEventListener('click', function (event) {
                        event.preventDefault();
                
                        const parentElement = this.parentElement.parentElement; // Accessing the parent div.recipe
                        const contentElement = parentElement.querySelector('ul');
                
                        if (contentElement) {
                            const remainingIngredients = recipe.ingredients.slice(1).map(ingr => `<li>${ingr}</li>`).join('');
                            const remainingSteps = recipe.method.split('\n').slice(1).map(step => `<p>${step}</p>`).join('');
                
                            contentElement.innerHTML += remainingIngredients + remainingSteps;
                            this.style.display = 'none'; // Hide "Show More" link
                
                            // Create "Show Less" link
                            const showLessLink = document.createElement('a');
                            showLessLink.href = '#';
                            showLessLink.textContent = 'Show Less';
                            showLessLink.classList.add('show-less');
                            this.parentElement.appendChild(showLessLink);
                
                            // Add event listener to "Show Less" link
                            showLessLink.addEventListener('click', function (event) {
                                event.preventDefault();
                                contentElement.innerHTML = ''; // Clear content
                                link.style.display = 'block'; // Show "Show More" link
                                this.style.display = 'none'; // Hide "Show Less" link
                            });
                        } else {
                            console.error('Content element not found.');
                        }
                    });
                });
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
            const editButtons = document.querySelectorAll('.edit-button');
            editButtons.forEach(button => {
                button.addEventListener('click', handleEdit);
            });
            
        }
    }

    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('print-button')) {
            const recipeDiv = event.target.closest('.recipe');
            if (recipeDiv) {
                const showMoreLink = recipeDiv.querySelector('.show-more');
                const showLessLink = recipeDiv.querySelector('.show-less');

                if ((showMoreLink && showLessLink) || (!showMoreLink && !showLessLink)) {
                    printRecipe(recipeDiv);
                } else {
                    alert("Cannot print: Recipe is in an expanded state.");
                }
            }
        }
    });

    function shareRecipe(event) {
        const recipeId = parseInt(event.target.dataset.id);
        // Display your custom modal here or any other custom logic for sharing
        // For simplicity, let's assume you're using a modal
        const modal = document.getElementById('myModal');
        modal.style.display = 'block';
    }

    // Close the modal when the user clicks on the close button
    const closeModalButton = document.getElementById('closeModal');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', function() {
            const modal = document.getElementById('myModal');
            modal.style.display = 'none';
        });
    }

    // Close the modal when the user clicks outside of it
    window.onclick = function(event) {
        const modal = document.getElementById('myModal');
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // Redirect to social media URLs
    window.redirectTo = function(url) {
        window.open(url, '_blank');
    };
        
    function printRecipe(recipeDiv) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            // Retrieve styles from the main document
            const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
                                .map(link => link.outerHTML)
                                .join('');

            // Create the content to print
            const contentToPrint = `
                <html>
                <head>
                    <title>Recipe</title>
                    ${styles}
                </head>
                <body>
                    ${recipeDiv.innerHTML}
                </body>
                </html>
            `;
            
            // Write the content to the print window
            printWindow.document.open();
            printWindow.document.write(contentToPrint);
            printWindow.document.close();

            // Print the window
            printWindow.print();
        } else {
            console.error('Could not open print window');
        }
    }

    function handleAddFavorite(event) {
        const recipeId = parseInt(event.target.dataset.id);
        const userEmail = sessionStorage.getItem('email');
        console.log('User Email:', userEmail);

        let favoriteRecipes = JSON.parse(localStorage.getItem(userEmail + '_favoriteRecipes')) || [];
        console.log('Current Favorite Recipes:', favoriteRecipes);

        if (!favoriteRecipes.includes(recipeId)) {
            favoriteRecipes.push(recipeId);
            localStorage.setItem(userEmail + '_favoriteRecipes', JSON.stringify(favoriteRecipes));
            console.log('Recipe added to favorites:', recipeId);
            alert('Recipe added to favorites!');
        } else {
            alert('Recipe is already in favorites!');
        }

        window.location.href = 'favorite_recipes.html';
    }


    function handleShowReviews(event) {
        const recipeId = parseInt(event.target.dataset.id);
        window.location.href = `reviews.html?recipeId=${recipeId}`;
    }

    function handleRate(event) {
        const recipeId = parseInt(event.target.dataset.id);
        const ratingsAndReviews = JSON.parse(localStorage.getItem('ratingsAndReviews')) || [];

        const userRating = ratingsAndReviews.find(item => item.recipeId === recipeId.toString());
        if (userRating) {
            alert('You have already rated this recipe.');
            return;
        }

        console.log('Rate button clicked for Recipe ID:', recipeId);
        window.location.href = `rate_review.html?recipeId=${recipeId}`;
    }

    function handleEdit(event) {
        // Find the recipe div associated with the clicked edit button
        var recipeDiv = event.target.closest('.recipe');
        if (!recipeDiv) {
            console.error('Recipe div not found for editing.');
            return;
        }
    
        // Extract recipe details from the recipeDiv
        var nameElement = recipeDiv.querySelector('h2');
        var imageElement = recipeDiv.querySelector('img');
        var ingredientsElement = recipeDiv.querySelector('.ingredients');
        var methodElement = recipeDiv.querySelector('.method');
    
        // Ensure all necessary elements are found
        if (!nameElement || !imageElement || !ingredientsElement || !methodElement) {
            console.error('One or more elements not found for editing.');
            return;
        }
    
        // Get the current values of the recipe details
        var name = nameElement.textContent;
        var imageUrl = imageElement.getAttribute('src');
        var ingredients = Array.from(ingredientsElement.querySelectorAll('li')).map(li => li.textContent);
        var method = methodElement.textContent;
    
        // Enable editing of the recipe details in-place
        nameElement.innerHTML = `<input type='text' value='${name}'>`;
        ingredientsElement.innerHTML = ingredients.map(ingr => `<input type='text' value='${ingr}'>`).join('<br>');
        methodElement.innerHTML = `<textarea>${method}</textarea>`;
    
        // Create an input field for the image URL
        var imageUrlInput = document.createElement('input');
        imageUrlInput.type = 'text';
        imageUrlInput.value = imageUrl;
        imageElement.parentNode.replaceChild(imageUrlInput, imageElement);
    
        // Extract the recipe ID from the edit button's data-id attribute
        var recipeId = event.target.dataset.id;
    
        // Show a save button to save the changes
        var saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.dataset.id = recipeId; // Set the recipe ID as a data attribute
        saveButton.addEventListener('click', function() {
            // Get the edited values
            var newName = nameElement.querySelector('input').value;
            var newImageUrl = imageUrlInput.value;
            var newIngredients = Array.from(ingredientsElement.querySelectorAll('input')).map(input => input.value);
            var newMethod = methodElement.querySelector('textarea').value;
    
            // Update the recipe details in the recipeDiv
            nameElement.innerHTML = newName;
            imageElement.src = newImageUrl;
            ingredientsElement.innerHTML = newIngredients.map(ingr => `<li>${ingr}</li>`).join('');
            methodElement.innerHTML = `<p>${newMethod}</p>`;
    
            // Hide the save button
            saveButton.remove();
    
            // Update the recipe object in the recipes array
            var recipeIndex = recipes.findIndex(recipe => recipe.id === parseInt(recipeId));
            
            if (recipeIndex !== -1) {
                recipes[recipeIndex].imageUrl = newImageUrl;
                recipes[recipeIndex].ingredients = newIngredients;
                recipes[recipeIndex].method = newMethod;
    
                // Update local storage with the modified recipes array
                localStorage.setItem('recipes', JSON.stringify(recipes));
            } else {
                console.error('Recipe not found for editing.');
            }
        });
    
        recipeDiv.appendChild(saveButton);
    }
    function handleDelete(event) {
        const recipeId = parseInt(event.target.dataset.id);
        
        // Remove the recipe from the recipes array
        recipes = recipes.filter(recipe => recipe.id !== recipeId);
        
        // Update the recipes stored in local storage
        localStorage.setItem('recipes', JSON.stringify(recipes));

        // Remove the recipe div from the UI
        const recipeDiv = event.target.closest('.recipe');
        if (recipeDiv) {
            recipeDiv.remove();
        } else {
            console.error('Recipe div not found for deletion.');
        }
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
    console.log(recipes)
});
