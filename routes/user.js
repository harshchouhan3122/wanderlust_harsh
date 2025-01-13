const express = require("express");  // Import express module
const router = express.Router();  // Create a new router
const wrapAsync = require("../utils/wrapAsync.js");  // Import wrapAsync utility to handle async errors
const userController = require("../controllers/users.js");  // Import user controller for handling routes
const passport = require("passport");  // Import passport for authentication
const { saveRedirectUrl } = require("../middleware.js");  // Import middleware to save redirect URL

// Signup Route
router.route("/signup")
    .get(userController.renderSignupForm) // Render Signup Form
    .post(wrapAsync(userController.signup)); // POST route to handle user signup, wrapped in async handler

// OTP Routes
router.post("/send-otp", express.json(), wrapAsync(userController.sendOTP));  // POST route to send OTP, expects JSON body
router.post("/verify-otp", express.json(), wrapAsync(userController.verifyOTP));  // POST route to verify OTP, expects JSON body

// Login Route
router.route("/login")
    .get(userController.renderLoginForm)  // Render Login Form
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), userController.login);  // POST route to handle login, uses passport for local strategy

router.get("/logout", userController.logout);  // GET route to log out the user

module.exports = router;  // Export the router for use in the app
