const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const userController = require("../controllers/users.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

// Signup Route
router.route("/signup")
    .get(userController.renderSignupForm) // Render Signup Form
    .post(wrapAsync(userController.signup)); // Signup Route

// OTP Routes
router.post("/send-otp", express.json(), wrapAsync(userController.sendOTP));
router.post("/verify-otp", express.json(), wrapAsync(userController.verifyOTP));


// Login Route
router.route("/login")
    .get( userController.renderLoginForm)           // render Login Form
    .post( saveRedirectUrl , passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), userController.login);  // Login Route

router.get("/logout", userController.logout); // Logout

module.exports = router;
