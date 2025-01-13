const Listing = require("../models/listing");  // Import the Listing model to interact with listings in the database
const Review = require("../models/review");    // Import the Review model to interact with reviews in the database


// Create Route: To add a new review to a listing
module.exports.createReview = async (req, res, next) => {
    
    let listing = await Listing.findById(req.params.id);  // Find the listing by its ID from the URL params
    // res.send(req.body.review);  // Uncomment this to check the review data being passed
    // console.log(req.body.review);  // Uncomment to log the review data for debugging

    let newReview = new Review(req.body.review);  // Create a new review using the review data from the request body

    newReview.createdBy = req.user._id;  // Save the createdBy field with the current logged-in user's ID

    listing.reviews.push(newReview);  // Push the new review into the listing's reviews array

    await newReview.save();  // Save the new review to the database
    await listing.save();  // Save the updated listing to the database

    // console.log("New review Saved...");  // Uncomment this to log success after saving the review
    // res.redirect(`/listings/${listing._id}`);  // Uncomment this to redirect to the listing page after saving

    req.flash("success", "New Review Added !");  // Flash success message after saving the review
    res.redirect(`/listings/${listing._id}`);  // Redirect to the listing page to show the updated review list
};


// Delete Route: To remove a review from a listing
module.exports.deleteReview = async (req, res, next) => {
    
    // console.log("Restructured");  // Uncomment this to log a message when the delete route is accessed

    let { id, reviewId } = req.params;  // Destructure the listing ID and review ID from the URL params

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });  // Update the listing by removing the review ID from the reviews array

    await Review.findByIdAndDelete(reviewId);  // Delete the review from the Review collection in the database

    // console.log("Review Deleted...");  // Uncomment this to log success after deleting the review
    // res.redirect(`/listings/${id}`);  // Uncomment this to redirect to the listing page after deletion

    req.flash("success", "Review Deleted !");  // Flash success message after deleting the review
    res.redirect(`/listings/${id}`);  // Redirect to the listing page to show the updated review list
};
