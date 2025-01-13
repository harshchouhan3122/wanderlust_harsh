const express = require("express");  // Importing express module
const router = express.Router({ mergeParams: true });  // Creating a router with merged params

// const ExpressError = require("../utils/ExpressError.js");  // Error handling module
const wrapAsync = require("../utils/wrapAsync.js");  // Import wrapAsync utility for async error handling

// const Listing = require("../models/listing.js");  // Import Listing model
// const { validateListing } = require("../schema.js");  // Import validation schema for listing
const { isLoggedIn, isOwner, checkListing } = require("../middleware.js");  // Import middleware functions

const listingController = require("../controllers/listings.js");  // Import listing controller functions


// app.use(express.urlencoded({extended:true}))                    // to get the parameters from the query String 
// app.use(methodOverride("_method"));                             // for PUT request in UPDATE Route
// app.engine("ejs", ejsMate);                                      // Set view engine to ejsMate for templates
// app.use(express.static(path.join(__dirname, "/public")));       // Serve static files (CSS, JS)


// File Uploading
const multer = require('multer');  // Import multer for handling file uploads

const { cloudinary, storage } = require("../cloudConfig.js");  // Import cloudinary config and storage options

// const upload = multer({ dest: 'uploads/' });    //Upload -> destination to save a file locally 
const upload = multer({ storage });  // Use Cloudinary storage for file uploads


// Router.route -> to combine the same named paths
router.get("/new", isLoggedIn, listingController.renderNewForm);   // Render form for creating new listing, only for logged-in users

router.route("/")
    .get(wrapAsync(listingController.index))  // Index Route, displays all listings
    .post(isLoggedIn, upload.single('listing[image]'), checkListing, wrapAsync(listingController.addListing));  // Create Route to add a new listing, requires login, image upload, and checkListing validation
    // .post( upload.single('listing[image]'), (req, res) => {  // Debugging alternative for file upload
    //     res.send(req.file); // Data related to file
    //     // res.send(req.body);
    // });

router.route("/:id")
    .get(wrapAsync(listingController.showListing))  // Show Route, displays a specific listing
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), checkListing, wrapAsync(listingController.updateListing))  // Update Route, requires login, owner check, and image upload
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));  // Destroy Route, requires login and owner check

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));  // Edit Route, renders form to edit a listing

module.exports = router;  // Export router for use in app
