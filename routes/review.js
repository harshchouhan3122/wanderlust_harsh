const express = require("express");
const router = express.Router({ mergeParams: true });

// const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");

// const Listing = require("../models/listing.js");
// const Review = require("../models/review.js");
// const { validateReview } = require("../schema.js");
const { validReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");


// Create Middleware to validate review -> Moved to middleware.js


// REVIEWS Route form new Review
router.post("/", isLoggedIn, validReview, wrapAsync( reviewController.createReview ));

// REVIEW DELETE Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor ,wrapAsync( reviewController.deleteReview ));

module.exports = router;