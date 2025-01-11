const express = require("express");
const router = express.Router();
// const User = require("../models/user.js");
const passport = require("passport");

// const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");

const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js")

// Router.route implemented
router.route("/signup")
    .get( userController.renderSignupForm)          // render Signup Form
    .post( wrapAsync( userController.signup));      // Signup Route

router.route("/login")
    .get( userController.renderLoginForm)           // render Login Form
    .post( saveRedirectUrl , passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), userController.login);  // Login Route

router.get("/logout", userController.logout);       // Logout Route


// OTP Verification
router.route("/signup/verifyOTP")
    .get( userController.renderOTPForm)          // render Signup Form
    .post( wrapAsync( userController.signup));      // Signup Route



module.exports = router;