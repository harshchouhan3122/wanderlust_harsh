// main backend File (Ist main File)

// .env file integration
if (process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");

const PORT = 3000;

const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");

const ejsMate = require("ejs-mate");

const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const { validateListing, validateReview } = require("./schema.js");

const Review = require("./models/review.js");


app.use(express.urlencoded({extended:true}))                    // to get the parameters from the query String 
app.use(methodOverride("_method"));                             //for PUT request in UPDATE Route
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));       //for CSS styling, to serve public folder files globally accessable



// for index.ejs 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



// // Connect Databse (Local)
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"

// MongoAtlasDB (Cloud Database)
const dbUrl = process.env.ATLASDB_URL;

async function main() {
    // await mongoose.connect(MONGO_URL);
    await mongoose.connect(dbUrl);
}

main().then(()=>{
    console.log("Connected to DB....");
})
.catch((err)=>{
    console.log(`Error Occurred: ${err}`)
    process.exit(1); // Exit the server if DB connection fails
})

// sessions for auto login functionality
const session = require("express-session");
const MongoStore = require("connect-mongo")

// connect-flash for alert messages
const flash = require("connect-flash");

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        // secret: "secretCode", 
        secret: process.env.SECRET, 
    },
    touchAfter: 24 * 3600 // time period in seconds
});

store.on("error", (err)=>{
    console.log("ERROR in MONGO SESSIONSTORE", err)
});

const sessionOptions = {
    store,
    // secret: "secretCode",
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        expires: Date.now() + (7 * 24 * 60 * 60 * 1000), //for 1 week , this function returns in millisec
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

// Authentication using Passport
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");



// Import Listing Routes (Restructuring Request Paths)
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");






// Root Directory
app.get("/", (req, res)=>{
    // res.send("Server is working....");
    res.redirect("/listings");
});



// use it before the using the routes
app.use(session(sessionOptions));
app.use(flash());


// passport's authentication middlewares
app.use(passport.initialize());         // middleware that initialize passport
app.use(passport.session());            // middleware that detects the same user in different requests/pages through the same session
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// middleware for flash messages, middleware to store local variables to use it in ejs files
app.use((req, res, next) => {
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    res.locals.currUser = req.user;           
    next();
});


// // Demo User
// app.get("/demoUser", async(req, res) => {
//     let fakeUser = new User({
//         email: "fakeUser@gmail.com",
//         username: "user1"
//     });

//     let registeredUser = await User.register(fakeUser, "password123");     //to register new user, also checks the username is unique or not
//     res.send(registeredUser);
// });





// Restructured Listings and reviews and then import there paths
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.use(express.json());


// ERROR HANDELING

// If the request isn't match with the above paths/ routes
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found !"));
});


// Custom Error Handler after all the routes
app.use((err, req, res, next) => {
    let { statusCode = 500, message="Something Went Wrong!!" } = err;

    console.log(`/// ERROR OCCURED ///  -> ${message}`);
    console.log(`ERROR OCCURED: ${err.stack}`);
    res.status(statusCode).render("error.ejs", { err });
});




// Start Server
app.listen(PORT, ()=>{
    console.log(`Server is listening to PORT: ${PORT}`);
});