document.addEventListener('DOMContentLoaded', function() {
    // Retrieve recipeId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = parseInt(urlParams.get('recipeId'));

    // Retrieve user email from sessionStorage
    const userEmail = sessionStorage.getItem('email');

    // Fetch ratings and reviews for the specified recipeId
    const ratingsAndReviews = JSON.parse(localStorage.getItem('ratingsAndReviews')) || [];

    // Filter ratings and reviews for the current recipe
    const recipeRatings = ratingsAndReviews.filter(item => item.recipeId === recipeId.toString());

    // Calculate average rating
    const averageRating = calculateAverageRating(recipeRatings, userEmail);

    // Display average rating
    const averageRatingContainer = document.getElementById('average-rating');
    if (averageRating !== null) {
        averageRatingContainer.textContent = `Average Rating: ${averageRating.toFixed(1)}`;
    } else {
        averageRatingContainer.textContent = 'No ratings yet';
    }

    // Display rating form if the user hasn't rated yet
    const ratingForm = document.getElementById('rating-form');
    const userRating = recipeRatings.find(item => item.userEmail === userEmail);
    if (!userRating) {
        ratingForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Get rating from the form
            const rating = parseInt(document.getElementById('rating').value);

            // Store the rating and review in localStorage
            ratingsAndReviews.push({ recipeId: recipeId.toString(), userEmail: userEmail, rating: rating });
            localStorage.setItem('ratingsAndReviews', JSON.stringify(ratingsAndReviews));

            // Refresh the page             to update the average rating
            // Instead of using location.reload()
            window.location.reload();

        });
    } else {
        ratingForm.style.display = 'none'; // Hide the rating form if the user has already rated
    }
});

function calculateAverageRating(recipeRatings, userEmail) {
    let totalRating = 0;
    let ratingCount = 0;
    
    for (let i = 0; i < recipeRatings.length; i++) {
        if (recipeRatings[i].userEmail !== userEmail) {
            totalRating += recipeRatings[i].rating;
            ratingCount++;
        }
    }
    
    if (ratingCount === 0) {
        return null;
    } else {
        return totalRating / ratingCount;
    }
}
