const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    registeredAt: {
        type: Date,
        required: true,
    },
    lastLoginAt: {
        type: Date,
        required: true,
    },
});

// plugin to use auto functionality of hashing and salting of username and password
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);