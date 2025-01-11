const { response } = require("express");


function sendOTP() {
    // const email = document.getElementById('email').value.trim(); // Trim to avoid leading/trailing spaces
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    // console.log("Email to be sent:", email); // Log the email value
    // console.log("Username to be sent:", username); // Log the email value
    // return;

    // if (!username) {
    //     alert("Please enter your name!");
    //     return;
    // }

    // if (!email) {
    //     alert("Please enter your email!");
    //     return;
    // }

    // Check if the form is valid
    // const form = document.querySelector('.needs-validation');
    // if (!form.checkValidity()) {
    //     form.classList.add('was-validated');
    //     return; // Stop if the form is invalid
    // }

    // Validation using Bootstrap
        // Get the form and the email/username fields
        const emailField = document.getElementById('email');
        const usernameField = document.getElementById('username');
    
        // Reset previous validation states
        emailField.classList.remove('is-invalid', 'is-valid');
        usernameField.classList.remove('is-invalid', 'is-valid');
        
        let valid = true;
    
        // Validate username
        if (!username) {
            usernameField.classList.add('is-invalid');
            valid = false;
        } else {
            usernameField.classList.add('is-valid');
        }
    
        // Validate email
        if (!email) {
            emailField.classList.add('is-invalid');
            valid = false;
        } else {
            emailField.classList.add('is-valid');
        }
    
        // If the username or email is invalid, stop the process
        if (!valid) {
            return;
        }

    fetch('/send-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ email }), // Send email in request body
        body: JSON.stringify({ email, username }), // Send email in request body
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.message === "OTP sent successfully!") {
                alert("OTP sent to your email!");
                document.getElementById('otpSection').style.display = 'block';
            } else {
                alert(data.message || "Failed to send OTP. Try again.");
            }
        })
        .catch((err) => {
            console.error("Error in fetch:", err);
            alert("An error occurred. Please try again.");
        });
}



function verifyOTP() {
    const otp = document.getElementById("otp").value;

    if (!otp) {
        alert("Please enter OTP!");
        return;
    }

    fetch("/verify-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp }),
    })
        .then((response) => {
            // If the response is not okay, throw an error
            if (!response.ok) {
                // Parse the response body and extract the message
                return response.json().then((data) => {
                    // Throw a custom error with the message from the server
                    throw new Error(data.message || 'An error occurred');
                });
            }
            // If the response is OK, parse the response body
            return response.json();
        })
        .then((data) => {
            alert(data.message);
            if (data.message === "OTP verified successfully!") {
                document.getElementById("signupButton").disabled = false; // Enable the signup button
            }
            else {
                console.log(data.message);
            }
        })
        .catch((err) => {
            console.error("Error in verifyOTP fetch:", err);
            // alert("An error occurred. Please try again.");
            alert(err);
        });
}
