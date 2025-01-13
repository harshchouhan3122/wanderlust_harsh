const { response } = require("express");  // Import response from express (not used here)

// Function to send OTP
function sendOTP() {
    const email = document.getElementById('email').value.trim();  // Get the email value and trim spaces
    const username = document.getElementById('username').value.trim();  // Get the username value and trim spaces

    // Validation using Bootstrap
    const emailField = document.getElementById('email');  // Get the email field element
    const usernameField = document.getElementById('username');  // Get the username field element
    
    // Reset previous validation states
    emailField.classList.remove('is-invalid', 'is-valid');  // Remove validation styles from email field
    usernameField.classList.remove('is-invalid', 'is-valid');  // Remove validation styles from username field
    
    let valid = true;  // Flag to track if both fields are valid
    
    // Validate username
    if (!username) {
        usernameField.classList.add('is-invalid');  // Add invalid class if username is empty
        valid = false;  // Set valid flag to false
    } else {
        usernameField.classList.add('is-valid');  // Add valid class if username is entered
    }
    
    // Validate email
    if (!email) {
        emailField.classList.add('is-invalid');  // Add invalid class if email is empty
        valid = false;  // Set valid flag to false
    } else {
        emailField.classList.add('is-valid');  // Add valid class if email is entered
    }
    
    // If the username or email is invalid, stop the process
    if (!valid) {
        return;  // Exit if either field is invalid
    }

    // Send a POST request to the server with email and username in the body
    fetch('/send-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username }),  // Send email and username as JSON
    })
        .then((response) => response.json())  // Parse the JSON response
        .then((data) => {
            if (data.message === "OTP sent successfully!") {
                alert("OTP sent to your email!");  // Alert user if OTP is sent successfully
                document.getElementById('otpSection').style.display = 'block';  // Show OTP input section
            } else {
                alert(data.message || "Failed to send OTP. Try again.");  // Alert if OTP sending fails
            }
        })
        .catch((err) => {
            console.error("Error in fetch:", err);  // Log error in case of fetch failure
            alert("An error occurred. Please try again.");  // Alert user of error
        });
}

// Function to verify OTP
function verifyOTP() {
    const otp = document.getElementById("otp").value;  // Get the entered OTP value

    if (!otp) {
        alert("Please enter OTP!");  // Alert user if OTP is empty
        return;
    }

    // Send a POST request to verify the OTP
    fetch("/verify-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp }),  // Send OTP as JSON
    })
        .then((response) => {
            if (!response.ok) {
                // If response is not OK, throw an error with server message
                return response.json().then((data) => {
                    throw new Error(data.message || 'An error occurred');  // Throw error with message
                });
            }
            return response.json();  // Parse response if OK
        })
        .then((data) => {
            alert(data.message);  // Alert user with response message
            if (data.message === "OTP verified successfully!") {
                document.getElementById("signupButton").disabled = false;  // Enable signup button after OTP verification
            } else {
                console.log(data.message);  // Log message if OTP verification fails
            }
        })
        .catch((err) => {
            console.error("Error in verifyOTP fetch:", err);  // Log error in case of fetch failure
            alert(err);  // Alert user of error
        });
}
