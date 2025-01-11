const User = require("../models/user");
const sendEmail = require("../utils/sendEmail.js");
const bcrypt = require("bcrypt");

// OTP generator function
const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

// Render Signup Form
module.exports.renderSignupForm = (req, res) => {
    res.render("./users/signup.ejs");
};

// Signup without generating OTP
module.exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });
        let registeredUser = await User.register(newUser, password);     //to register new user, also checks the username is unique or not
        req.session.email = email; // Store email in session
        req.flash("success", "Welcome to WanderLust! Please verify your email.");
        // res.redirect("/signup/verifyOTP");
        
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
        console.error(`Error -> ${e.message}`);
        res.redirect("/signup");
    }
};

// Render OTP Verification Form
module.exports.renderOTPForm = (req, res) => {
    res.render("./users/verifyOTP.ejs");
};

// Send OTP
module.exports.sendOTP = async (req, res) => {
    const { email, username } = req.body;
    // console.log("Request body:", req.body); // Log the request body

    if (!username) {
        // console.log("Username is missing from the request body");
        return res.status(400).json({ message: "Username is required" });
    }

    if (!email) {
        // console.log("Email is missing from the request body");
        return res.status(400).json({ message: "Email is required" });
    }

    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp.toString(), 10);        //Storig hashed OTP in Session Cookie
    req.session.otp = hashedOTP;
    req.session.otpGeneratedAt = Date.now();

    try {
        // console.log(`Sending OTP to: ${username} - ${email}, OTP: ${otp}`);
        await sendEmail(email, username, otp); // Send email with OTP
        // console.log("OTP sent successfully!");
        res.status(200).json({ message: "OTP sent successfully!" });
    } catch (error) {
        // console.error("Error while sending OTP:", error);
        res.status(500).json({ message: "Failed to send OTP. Please try again." });
    }
};



// Verify OTP
module.exports.verifyOTP = async (req, res) => {
    // console.log("Received request to verify OTP"); // Debug log
    // console.log("Request body:", req.body); // Log request body

    const { otp } = req.body;

    if (!req.session.otp) {
        // console.error("No OTP found in session.");
        return res.status(400).json({ message: "No OTP found in session. Please request a new one." });
    }

    const otpExpirationTime = 5 * 60 * 1000; // 5 minutes

    if (Date.now() - req.session.otpGeneratedAt > otpExpirationTime) {
        // console.error("OTP has expired.");
        return res.status(400).json({ message: "OTP has expired. Resend OTP." });
    }

    try {
        const isOTPValid = await bcrypt.compare(otp.toString(), req.session.otp);
        if (!isOTPValid) {
            // console.error("Invalid OTP.");
            return res.status(400).json({ message: "Invalid OTP. Resend OTP." });
        }

        // Clear OTP after successful verification
        req.session.otp = null;
        req.session.otpGeneratedAt = null;

        console.log("OTP verified successfully.");
        return res.status(200).json({ message: "OTP verified successfully!" });
    } catch (err) {
        console.error("Error in verifying OTP:", err);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};



// Render Login Form
module.exports.renderLoginForm = (req, res) => {
    res.render("./users/login.ejs");
};


// Login
// module.exports.login = (req, res) => {
//     req.flash("success", "Welcome back to WanderLust!");
    
//     // Check for a redirect URL stored in the session (if any)
//     const redirectUrl = req.session.redirectTo || "/listings"; 
    
//     // Clear the redirect URL from the session
//     delete req.session.redirectTo; 
    
//     // Redirect the user
//     res.redirect(redirectUrl);
// };
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
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};
