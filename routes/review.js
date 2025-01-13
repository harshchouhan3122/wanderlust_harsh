const express = require("express");  // Importing express module
const router = express.Router({ mergeParams: true });  // Creating a router with merged params for nested routes

// const ExpressError = require("../utils/ExpressError.js");  // Import custom error handling module
const wrapAsync = require("../utils/wrapAsync.js");  // Import wrapAsync utility to handle async errors

// const Listing = require("../models/listing.js");  // Import Listing model (commented out as not used here)
// const Review = require("../models/review.js");  // Import Review model (commented out as not used here)
// const { validateReview } = require("../schema.js");  // Import review validation schema (commented out as moved to middleware)
const { validReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");  // Import middleware for validation and authorization checks

const reviewController = require("../controllers/reviews.js");  // Import review controller functions


// Create Middleware to validate review -> Moved to middleware.js


// REVIEWS Route form new Review
router.post("/", isLoggedIn, validReview, wrapAsync(reviewController.createReview));  // POST route to create a review, requires login and validation

// REVIEW DELETE Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));  // DELETE route to delete a review, requires login and authorization check

module.exports = router;  // Export router for use in app
