// In this file we have designed the Schema for the Listings

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const User = require("./user.js");

const defaultImgURL = "https://unsplash.com/photos/a-paper-model-of-a-house-on-a-small-island-gTNAhl22eaE";


const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
      url: String,
      filename: String
    },
  //   image: {
  //   //     type: String,
  //   //     default: defaultImgURL,
  //   //     set: (v) => v === "" ? defaultImgURL : v
  //   // },
  //     filename:{type:String},
  //     url:{type:String,
  //         default:
  //             "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
  //           set: (v) =>
  //             v === ""
  //               ? "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
  //               : v,
  //     }    
  // },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    }
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  coordinates : {
    type: [Number],
    required: true
  }
});


// POST Mongoose Middleware for deleting reviews of Listing
listingSchema.post("findOneAndDelete", async(listing) => {
  if (listing) {
    await Review.deleteMany({_id: {$in: listing.reviews}});
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
