document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('recipe-form');
    let recipes = [];

    function handleSubmit(event) {
        event.preventDefault();

        const nameInput = document.querySelector('#recipe-name');
        const imageInput = document.querySelector('#recipe-image');
        const ingrInput = document.querySelector('#recipe-ingredients');
        const methodInput = document.querySelector('#recipe-method');
        
        const name = nameInput.value.trim();
        const imageUrl = imageInput.value.trim();
        const ingredients = ingrInput.value.trim().split(',').map(i => i.trim());
        const method = methodInput.value.trim();

        if (name && imageUrl && ingredients.length > 0 && method) {
            const newRecipe = { name, imageUrl, ingredients, method };
            recipes.push(newRecipe);
            nameInput.value = '';
            imageInput.value = '';
            ingrInput.value = '';
            methodInput.value = '';
            // Optionally, you can redirect to the display page after adding a recipe
            // window.location.href = 'display_recipes.html';
        }
    }

    form.addEventListener('submit', handleSubmit);
});
