// .env file integration
if (process.env.NODE_ENV != "production") {
    require('dotenv').config(); // Load environment variables for non-production environments
}

// Required Libraries
const express = require("express"); // Express is a minimalist web framework for Node.js, used for handling HTTP requests and routing.
const mongoose = require("mongoose"); // Mongoose is an ODM for MongoDB, making it easier to work with the database by defining schemas and models.
const session = require("express-session"); // Express-session is used to manage sessions on the server, allowing us to store data like login information between requests.
const passport = require("passport"); // Passport is used for authentication, supporting multiple authentication strategies, including local and social logins.
const LocalStrategy = require("passport-local"); // LocalStrategy is a Passport strategy for handling username and password authentication.
const MongoStore = require("connect-mongo"); // Connect-mongo is a MongoDB session store, ensuring that session data is stored in MongoDB and persists across server restarts.
const flash = require("connect-flash"); // Connect-flash is used for passing flash messages between requests, typically for showing temporary messages like success or error alerts.
const methodOverride = require("method-override"); // Method-override allows HTTP methods like PUT and DELETE to be used in forms, even if browsers only support GET and POST.
const path = require("path"); // Path is a Node.js core module used for handling and transforming file paths in a platform-independent manner.
const ejsMate = require("ejs-mate"); // Ejs-mate is a template engine for Express that extends the default EJS engine, adding features like layouts for more efficient template management.


const { validateListing, validateReview } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");

// Models
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const User = require("./models/user.js");

// Initializing Express
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Database Connection (Cloud Database)
const dbUrl = process.env.ATLASDB_URL; // Database connection URL from environment variables

async function main() {
    await mongoose.connect(dbUrl); // Connect to MongoDB
}

main().then(() => {
    console.log("Connected to DB....");
}).catch((err) => {
    console.log(`Error Occurred: ${err}`);
    // process.exit(1); // Exit the server if DB connection fails
});

// Middleware Configuration
app.use(express.urlencoded({ extended: true }));  // to get the parameters from the query String
app.use(methodOverride("_method"));  // For handling PUT requests in routes

// EJS Setup
app.engine("ejs", ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Files
app.use(express.static(path.join(__dirname, "/public"))); // Serving CSS, JS, and images from the 'public' directory

// Body Parser Middleware
app.use(express.json()); // to send selected form data to backend

// Session Configuration for Authentication and Auto-login Functionality
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: { secret: process.env.SECRET }, // Secret key for encrypting session data
    touchAfter: 24 * 3600 // Update session after 24 hours
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSIONSTORE", err); // Log errors for session store
});

const sessionOptions = {
    store,
    secret: process.env.SECRET, // Secret for session encryption
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + (7 * 24 * 60 * 60 * 1000), // Cookie expires in 1 week
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, // Prevents client-side access to cookie
    },
};

app.use(session(sessionOptions));
app.use(flash());                   // Flash messages for notifications, flahes only when redirect occurs



// Passport Authentication Setup
app.use(passport.initialize());  // Initializes Passport to handle authentication processes
app.use(passport.session());  // Keeps the user logged in across different requests by storing session data in the session cookie

// Use LocalStrategy for user authentication
passport.use(new LocalStrategy(User.authenticate())); 
// The LocalStrategy is a built-in Passport strategy that uses a username and password to authenticate a user.
// The User.authenticate() method is a Mongoose method provided by passport-local-mongoose that checks the user credentials.

// Serialize user information into the session
passport.serializeUser(User.serializeUser());  
// Serialization converts the user object into a format (usually just the user ID) that can be stored in the session.

// Deserialize user information from the session
passport.deserializeUser(User.deserializeUser()); 
// Deserialization fetches the full user object from the stored user ID in the session and makes it available as req.user in routes.



// Middleware to store local variables (success/error messages and current user) for EJS views
app.use((req, res, next) => {
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    res.locals.currUser = req.user; // Current logged-in user
    next();
});

// Import Routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Root Route - Redirect to Listings
app.get("/", (req, res) => {
    res.redirect("/listings");  // Redirect to the listings page
});

// Route Configuration
app.use("/listings", listingRouter);  // Listings-related routes
app.use("/listings/:id/reviews", reviewRouter);  // Reviews-related routes
app.use("/", userRouter);  // User-related routes

// Error Handling Middleware
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));  // Handle unmatched routes
});

// Custom Error Handler for all errors
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something Went Wrong!!" } = err;
    console.log(`/// ERROR OCCURED ///  -> ${message}`);
    // console.log(`ERROR OCCURED: ${err.stack}`); // Uncomment for full error stack trace
    res.status(statusCode).render("error.ejs", { err });
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is listening on PORT: ${PORT}`);
});
