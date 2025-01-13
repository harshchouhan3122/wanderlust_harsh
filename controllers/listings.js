const Listing = require("../models/listing");  // Import the Listing model to interact with listings in the database

// Index Route (All Listings)
module.exports.index = async (req, res, next) => {
    const allListings = await Listing.find({});  // Retrieve all listings from the database
    // console.log(allListings);  // Uncomment this to log all listings
    // console.log("All Listings from the DB...");  // Uncomment this to log a message when retrieving listings
    // res.send(allListings);  // Uncomment this to send all listings as a response
    res.render("listings/index.ejs", {allListings});  // Render the listings index page
};

// Render New Form for new Listing
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");  // Render the form for creating a new listing
    // console.log("Loading Form to Create new Listing...");  // Uncomment this to log the form loading
};

// Create Route (Save new Listing)
module.exports.addListing = async(req, res, next) => {
    // console.log("Request Body:", req.body);  // This will print the entire body of the request
    // console.log("Listing Data:", req.body.listing);  // This will print only the 'listing' part
    // console.log("Coordinates:", req.body.listing.coordinates);  // Log the coordinates to verify they are in the expected format

    // for image
    let url = req.file.path;  // Get the image URL from the uploaded file path
    let filename = req.file.filename;  // Get the filename from the uploaded file
    // console.log(url, filename);  // Uncomment this to log image URL and filename

    const newListing = new Listing(req.body.listing);  // Create a new listing using the request body

    // Parse coordinates as an object with lat and lng properties
    const coordinates = JSON.parse(req.body.listing.coordinates);  // Should be { lat: ..., lng: ... }
    // console.log("Coordinates (after parsing):", coordinates);  // Uncomment to log parsed coordinates

    console.log(`User Creating New Listing -> ${req.user}`);  // Log the user creating the listing
    newListing.owner = req.user._id;  // Set the current user as the owner of the new listing
    newListing.image = {url, filename};  // Save the image URL and filename in MongoDB
    newListing.coordinates = [coordinates.lat, coordinates.lng];  // Set the coordinates for the listing

    // console.log(`Final Listing to save :::::  ${newListing}`);  // Uncomment this to log the final listing object
    await newListing.save();  // Save the new listing in the database

    console.log("New Listing Added Successfully...");  // Uncomment this to log successful addition of the listing
    req.flash("success", "New listing Added Successfully !");  // Flash success message
    res.redirect("/listings");  // Redirect to the listings page
};

// Show Route
module.exports.showListing = async (req, res, next) => {
    let { id } = req.params;  // Get the listing ID from the URL parameters
    // let listing = await Listing.findById(id).populate("reviews").populate("owner");  // Uncomment this for basic population

    // Nested Populate for display username with review
    let listing = await Listing.findById(id)
                    .populate({
                        path: "reviews",
                        populate: {
                            path: "createdBy"
                        },
                    })
                    .populate("owner");

    // console.log(req.user);  // Uncomment this to log the current user
    // console.log(listing.owner._id);  // Uncomment this to log the listing owner's ID

    if (listing) {
        // console.log(listing);  // Uncomment this to log the listing details
        res.render("listings/show.ejs", {listing});  // Render the listing details page
    } else {
        // console.log("Listing not found...");  // Uncomment this to log when the listing is not found
        req.flash("error", "Requested Listing not found !");  // Flash error message if listing is not found
        res.redirect("/listings");  // Redirect to the listings page
    }
    // console.log("Listing available...");  // Uncomment this to log when a listing is available
};

// Edit Route
module.exports.renderEditForm = async (req, res, next) => {
    let {id} = req.params;  // Get the listing ID from the URL parameters
    let listing = await Listing.findById(id);  // Find the listing by ID

    // console.log(listing);  // Uncomment this to log the listing details

    if (listing) {
        // Image Transformation using Cloudinary
        let originalImageURL = listing.image.url;
        let previewImageURL = originalImageURL.replace("/upload", "/upload/c_fill,h_250");

        // console.log('Loading Form to Edit Listing......');  // Uncomment this to log form loading
        res.render("listings/edit.ejs", {listing, previewImageURL});  // Render the edit form for the listing
    } else {
        // console.log("Listing not found...");  // Uncomment this to log when the listing is not found
        req.flash("error", "Requested Listing not found !");  // Flash error message
        res.redirect("/listings");  // Redirect to the listings page
    }
};

// Update Route
module.exports.updateListing = async(req, res, next) => {
    let { id } = req.params;  // Get the listing ID from the URL parameters

    // We created middleware isOwner for below commented code
    // let listing = await Listing.findById(id);  // Uncomment this to find the listing by ID
    // if (!listing.owner._id.equals(req.user._id)){  // Uncomment this to check ownership
    //     req.flash("error", "You don't have permission to edit this listing.");  // Flash error message
    //     console.log("Unauthorized Person trying to Edit the Listing.")  // Log unauthorized access
    //     return res.redirect(`/listings/${id}`);  // Redirect if unauthorized
    // } 
    
    // console.log({ ...req.body.listing});  // Uncomment this to log the updated listing data
    let updateListing = { ...req.body.listing};  // Create an object for updating the listing
    // console.log(updateListing);  // Uncomment this to log the update object

    // Convert coordinates from String to Number
    // coordinates = JSON.parse(req.body.listing.coordinates);  // Convert string '[28,75]' into an array [28, 75]
    // console.log("Coordinates (after parsing):", coordinates);  // Uncomment this to log parsed coordinates
    // updateListing.coordinates = coordinates;

    // Parse the coordinates JSON string into an object with lat and lng
    const coordinates = JSON.parse(req.body.listing.coordinates);
    // Check that lat and lng are numbers, then assign to the updateListing object
    if (typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number') {
        updateListing.coordinates = [coordinates.lat, coordinates.lng];  // Convert to an array format expected by Mongoose
    } else {
        console.error("Invalid coordinate format");  // Uncomment this to log invalid coordinate format
        return res.status(400).send("Invalid coordinate format");  // Return error if invalid format
    }

    let listing = await Listing.findByIdAndUpdate(id, updateListing);  // Update the listing in the database

    // If we get the file in edit form then only we are going to extract url and filename from the form
    if (typeof req.file !== "undefined") {
        let url = req.file.path;  // Get the image URL from the uploaded file path
        let filename = req.file.filename;  // Get the filename from the uploaded file
        listing.image = {url, filename};  // Update the image details in the listing

        await listing.save();  // Save the updated listing
    }

    req.flash("success", "Listing Updated !");  // Flash success message
    res.redirect(`/listings/${id}`);  // Redirect to the updated listing page
    // console.log("Listing Edited and Updated Successfully...");  // Uncomment this to log successful update
};

// Delete Route / Destroy Route
module.exports.deleteListing = async (req, res, next) => {
    let { id } = req.params;  // Get the listing ID from the URL parameters
    let result = await Listing.findByIdAndDelete(id);  // Delete the listing by ID
    
    console.log(`User Deleting Listing -> ${req.user}`);  // Log user deleting the listing
    console.log(`Listing Deleted... -> ${result.title},${result.location},${result.country}`);  // Log deleted listing details
    req.flash("success", "Listing Deleted !")  // Flash success message
    res.redirect('/listings');  // Redirect to the listings page
};
