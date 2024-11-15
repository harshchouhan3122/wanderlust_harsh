const Listing = require("../models/listing");
const Review = require("../models/review");


// Create Route
module.exports.createReview = async (req, res, next) => {
    
    let listing = await Listing.findById(req.params.id);
    // res.send(req.body.review);
    // console.log(req.body.review);
    let newReview = new Review(req.body.review);

    // Save the createdBy field with this newListing as currUser
    newReview.createdBy = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("New review Saved...");
    // res.redirect(`/listings/${listing._id}`);
    req.flash("success", "New Review Added !");
    res.redirect(`/listings/${listing._id}`);
};

// Delete Route
module.exports.deleteReview = async (req, res, next) => {
    // console.log("Restructured");
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {pull: {reviews: reviewId}});   //Updating the reviews array of Listing
    await Review.findByIdAndDelete(reviewId);

    console.log("Review Deleted...");
    // res.redirect(`/listings/${id}`);
    req.flash("success", "Review Deleted !");
    res.redirect(`/listings/${id}`);
};

