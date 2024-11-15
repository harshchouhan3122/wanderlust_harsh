const User = require("../models/user");

// Render Signup Form
module.exports.renderSignupForm = (req, res, next) => {
    res.render("./users/signup.ejs");
};

// Signup -> Register Route
module.exports.signup =  async (req, res, next) => {
    try{
        let { username, email, password } = req.body;
        // res.send(email);
        const newUser = new User({email, username});
    
        let registeredUser = await User.register(newUser, password);     //to register new user, also checks the username is unique or not
        // res.send(registeredUser);
    
        // Auto Login after Signup
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            };

            req.flash("success", "Welcome to WanderLust!");
            // console.log(`User Registered Successfully! -> ${registeredUser.username}, ${registeredUser.email}, ${registeredUser.hash}`); //hash is a hashed password
            console.log(`User Registered Successfully! -> ${registeredUser.username}, ${registeredUser.email}`);
            res.redirect("/listings");
        });

    } catch (e) {
        req.flash("error", e.message);
        console.log(`Error -> ${e.message}.`);
        res.redirect("/signup");
    }

};

// Render Login Form
module.exports.renderLoginForm = (req, res, next) => {
    res.render("./users/login.ejs");
};

// Login
module.exports.login = async(req, res) => {
    req.flash("success", "Welcome back to WanderLust !");
    console.log("User Logged in Successfully!");
    // res.redirect("/listings");

    // let redirectUrl = req.locals.redirectUrl || "/listings";
    // console.log(res.session.redirectUrl);
    console.log(res.locals.redirectUrl);
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

// Logout 
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        
        req.flash("success", "You are Logged out!");
        // console.log(` ${req.user.username} User Logged Out");
        res.redirect("/listings");
    });
};