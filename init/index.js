// this file is used to intialize the Data

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main(){
    await mongoose.connect(MONGO_URL);
};

main().then(()=>console.log("Connected to DB....")).catch((err)=>console.log(err));

const initDB = async () => {
    // Delete the existing DB
    await Listing.deleteMany({});
    
    // Assign the same coordinates [20, 40] and a fixed owner ID to all listings
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "6735ab649714e6944be13201",      // ID of the owner, create a user first in the database
        coordinates: [33.2778, 75.3412],        // Assign fixed coordinates to all previous listings 
    }));

    // Insert the modified data into the database
    await Listing.insertMany(initData.data);

    console.log("Data Initialized Successfully.....");
};

initDB();