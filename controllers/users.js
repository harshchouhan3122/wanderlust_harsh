const User = require("../models/user"); // User model for managing user data
const sendEmail = require("../utils/sendEmail.js"); // Utility to send OTP email
const bcrypt = require("bcrypt"); // To hash the OTP for secure storage

// OTP generator function
const generateOTP = () => Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP

// Render Signup Form
module.exports.renderSignupForm = (req, res) => {
    res.render("./users/signup.ejs"); // Renders the signup page
};

// Signup after generating OTP
module.exports.signup = async (req, res) => {
    try {
        // Destructure user details from the request body
        const { username, email, password } = req.body;
        const { registeredAt, lastLoginAt } = { registeredAt: Date.now(), lastLoginAt: Date.now() };

        // Create a new user instance and register the user
        const newUser = new User({ email, username, registeredAt, lastLoginAt });
        let registeredUser = await User.register(newUser, password); // Registers the user and checks if the username is unique
        
        // Store email in session
        req.session.email = email; 
        
        // Send a flash message prompting email verification
        req.flash("success", "Welcome to WanderLust! Please verify your email.");

        // Auto Login after Signup
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err); // Handle errors during login
            }

            req.flash("success", "Welcome to WanderLust!");
            console.log(`User Registered Successfully! -> ${registeredUser.username}, ${registeredUser.email}`);
            res.redirect("/listings"); // Redirect to listings page after successful registration
        });
        
    } catch (e) {
        // Handle errors during registration
        if (e.code === 11000) { // Check for MongoDB duplicate key error code
            const field = Object.keys(e.keyPattern)[0]; // Get the field causing the conflict
            const errorMsg = `A user with this ${field} already exists.`; // Display appropriate error message
            req.flash("error", errorMsg);
        } else {
            req.flash("error", e.message); // Flash error message for other types of errors
        }

        console.error(`Error -> ${e.message}`);
        res.redirect("/signup"); // Redirect back to signup page in case of error
    }
};

// Render OTP Verification Form
module.exports.renderOTPForm = (req, res) => {
    res.render("./users/verifyOTP.ejs"); // Render the OTP verification page
};

// Send OTP
module.exports.sendOTP = async (req, res) => {
    const { email, username } = req.body; // Destructure email and username from request body

    // Check if username and email are provided
    if (!username) {
        return res.status(400).json({ message: "Username is required" }); // Return error if username is missing
    }

    if (!email) {
        return res.status(400).json({ message: "Email is required" }); // Return error if email is missing
    }

    const otp = generateOTP(); // Generate OTP
    const hashedOTP = await bcrypt.hash(otp.toString(), 10); // Hash OTP before storing it in session

    req.session.otp = hashedOTP; // Store hashed OTP in session
    req.session.otpGeneratedAt = Date.now(); // Store OTP generation time

    try {
        // Send OTP email to user
        await sendEmail(email, username, otp); 
        res.status(200).json({ message: "OTP sent successfully!" }); // Respond with success message
    } catch (error) {
        res.status(500).json({ message: "Failed to send OTP. Please try again." }); // Handle errors during OTP sending
    }
};

// Verify OTP
module.exports.verifyOTP = async (req, res) => {
    const { otp } = req.body; // Destructure OTP from request body

    if (!req.session.otp) {
        return res.status(400).json({ message: "No OTP found in session. Please request a new one." }); // Handle case when OTP is not found in session
    }

    const otpExpirationTime = 5 * 60 * 1000; // OTP expires after 5 minutes

    if (Date.now() - req.session.otpGeneratedAt > otpExpirationTime) {
        return res.status(400).json({ message: "OTP has expired. Resend OTP." }); // Handle expired OTP
    }

    try {
        const isOTPValid = await bcrypt.compare(otp.toString(), req.session.otp); // Compare provided OTP with the stored hashed OTP
        if (!isOTPValid) {
            return res.status(400).json({ message: "Invalid OTP. Resend OTP." }); // Handle invalid OTP
        }

        // Clear OTP after successful verification
        req.session.otp = null;
        req.session.otpGeneratedAt = null;

        res.status(200).json({ message: "OTP verified successfully!" }); // OTP verified successfully
    } catch (err) {
        res.status(500).json({ message: "Server error. Please try again later." }); // Handle server errors
    }
};

// Render Login Form
module.exports.renderLoginForm = (req, res) => {
    res.render("./users/login.ejs"); // Render the login page
};

// Login after successful authentication
module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to WanderLust!"); // Flash message for successful login

    const { username } = req.body;
    console.log(`${username} -> Logged in Successfully!`);

    // Update the login time in the backend for the logged-in user
    const user = await User.findOne({ username });
    user.lastLoginAt = new Date();
    await user.save();

    let redirectUrl = res.locals.redirectUrl || "/listings"; // Redirect URL after login (default to listings)
    res.redirect(redirectUrl); // Redirect the user to the appropriate page after login
};

// Logout
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err); // Handle errors during logout
        }
        req.flash("success", "You are logged out!"); // Flash message for successful logout
        res.redirect("/listings"); // Redirect to listings page after logout
    });
};
