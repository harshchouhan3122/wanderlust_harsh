// .env file integration
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// Required Libraries
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Models and Utility Functions
const Listing = require("./models/listing.js");
const User = require("./models/user.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");
const { validateListing, validateReview } = require("./schema.js");

// Initialize Express
const app = express();
const PORT = 3000;

// MongoDB Connection (Local or Cloud Database based on environment variable)
const dbUrl = process.env.ATLASDB_URL;
async function main() {
    await mongoose.connect(dbUrl);
}

main().then(() => {
    console.log("Connected to DB....");
}).catch((err) => {
    console.log(`Error Occurred: ${err}`);
    process.exit(1); // Exit server if DB connection fails
});

// Set up template engine
app.engine("ejs", ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files configuration (CSS, JS, images)
app.use(express.static(path.join(__dirname, "/public"))); // Serving files in public directory
app.use(express.urlencoded({ extended: true })); // For parsing form data
app.use(methodOverride("_method")); // For PUT request in routes

// Session and Passport setup for Authentication
const sessionOptions = {
    store: MongoStore.create({
        mongoUrl: dbUrl,
        crypto: { secret: process.env.SECRET },
        touchAfter: 24 * 3600 // Update session after 24 hours
    }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        expires: Date.now() + (7 * 24 * 60 * 60 * 1000), // Cookie expires in 1 week
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

// Initialize session and flash
app.use(session(sessionOptions));
app.use(flash());

// Passport.js Authentication setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware for storing flash messages and current user
app.use((req, res, next) => {
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    res.locals.currUser = req.user; // Current logged-in user
    next();
});

// Import Routes (Restructuring for better organization)
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Root Route (Redirect to Listings)
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// Using imported routes
app.use("/listings", listingRouter); // Listing-related routes
app.use("/listings/:id/reviews", reviewRouter); // Review-related routes
app.use("/", userRouter); // User-related routes

// Error Handling Middleware
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// Custom error handler for all errors
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something Went Wrong!!" } = err;
    console.log(`ERROR OCCURRED -> ${message}`);
    console.log(`ERROR STACK -> ${err.stack}`);
    res.status(statusCode).render("error.ejs", { err });
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is listening on PORT: ${PORT}`);
});
