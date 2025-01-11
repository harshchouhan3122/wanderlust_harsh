const Listing = require("./models/listing");
const Review = require("./models/review");

const ExpressError = require("./utils/ExpressError.js");
const { validateListing, validateReview } = require("./schema.js");

// listing.js and review.js
module.exports.isLoggedIn = (req, res, next) => {
    // console.log(`User (currently logged in) details: ${req.user}`);
    if (!req.isAuthenticated()) {       //means no user is logged in
        req.session.redirectUrl = req.originalUrl;
        console.log("Current URL -> " + req.session.redirectUrl);
        req.flash("error","User must be Logged in.");
        return res.redirect("/login");

    }
    next();
};

// user.js
module.exports.saveRedirectUrl = (req, res, next) => {
    // console.log("saveRedirect middleware called...");
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        // console.log("locally URL saved...");
    }
    next();
};

// listing.js
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    // if (!listing.owner._id.equals(req.user._id)){
    if (!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this listing.");
        console.log("Unautherized Person trying to Edit the Listing.")
        return res.redirect(`/listings/${id}`); 
    } 

    next();
};

// listings.js
module.exports.checkListing = (req, res, next) => {
    const { error } = validateListing.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
        // throw new ExpressError(400, error.details[0].message);
    } else {
        next();
    }
};

// review.js
module.exports.validReview = (req,res,next) => {
    const { error } = validateReview.validate(req.body);
    // console.log(error);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};


// review.js
module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);

    if (!review.createdBy._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the author of this review.");
        console.log("Unautherized Person trying to delete the review.")
        return res.redirect(`/listings/${id}`); 
    } 
    next();
};

