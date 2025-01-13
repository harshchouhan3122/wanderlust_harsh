const Listing = require("./models/listing");
const Review = require("./models/review");

const ExpressError = require("./utils/ExpressError.js");
const { validateListing, validateReview } = require("./schema.js");

// listing.js and review.js
module.exports.isLoggedIn = (req, res, next) => {
    // console.log(`User (currently logged in) details: ${req.user}`);
    if (!req.isAuthenticated()) {  // means no user is logged in
        req.session.redirectUrl = req.originalUrl;  // Save the current URL to session for redirection after login
        console.log("Current URL -> " + req.session.redirectUrl);
        req.flash("error", "User must be Logged in.");
        return res.redirect("/login");  // Redirect to login if not authenticated
    }
    next();  // Continue to next middleware if user is authenticated
};

// user.js
module.exports.saveRedirectUrl = (req, res, next) => {
    // console.log("saveRedirect middleware called...");
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;  // Store the redirect URL locally for use in views
        // console.log("locally URL saved...");
    }
    next();  // Continue to the next middleware
};

// listing.js
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    // if (!listing.owner._id.equals(req.user._id)){
    if (!listing.owner._id.equals(res.locals.currUser._id)) {  // Check if the current user is the owner of the listing
        req.flash("error", "You are not the owner of this listing.");
        console.log("Unauthorized Person trying to Edit the Listing.");
        return res.redirect(`/listings/${id}`);  // Redirect if the user is not the owner
    }

    next();  // Proceed to the next middleware if the user is the owner
};

// listings.js
module.exports.checkListing = (req, res, next) => {
    const { error } = validateListing.validate(req.body);  // Validate the listing data
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");  // Get validation error messages
        throw new ExpressError(400, errMsg);  // Throw an ExpressError if validation fails
        // throw new ExpressError(400, error.details[0].message);  // Alternative error handling for first error only
    } else {
        next();  // Proceed if validation is successful
    }
};

// review.js
module.exports.validReview = (req, res, next) => {
    const { error } = validateReview.validate(req.body);  // Validate the review data
    // console.log(error);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");  // Get validation error messages
        throw new ExpressError(400, errMsg);  // Throw an ExpressError if validation fails
    } else {
        next();  // Proceed if validation is successful
    }
};

// review.js
module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);

    if (!review.createdBy._id.equals(res.locals.currUser._id)) {  // Check if the current user is the author of the review
        req.flash("error", "You are not the author of this review.");
        console.log("Unauthorized Person trying to delete the review.");
        return res.redirect(`/listings/${id}`);  // Redirect if the user is not the author
    }
    next();  // Proceed to the next middleware if the user is the author
};
