const Joi = require('joi');

// for Server Side validation
// Define the Joi schema to match the form's nested structure
const validateListing = Joi.object({
    listing: Joi.object({
        title: Joi.string().required().messages({
            'string.empty': 'Title is required.'
        }),
        description: Joi.string().required().messages({
            'string.empty': 'Description is required.'
        }),
        price: Joi.number().required().min(0).messages({
            'number.base': 'Price must be a valid number.',
            'number.min': 'Price must be greater than or equal to 0.',
            'any.required': 'Price is required.'
        }),
        country: Joi.string().required().messages({
            'string.empty': 'Country is required.'
        }),
        location: Joi.string().required().messages({
            'string.empty': 'Location is required.'
        }),

        // image: Joi.object({
        //     url: Joi.string().uri().allow('', null).messages({
        //         'string.uri': 'Image URL must be a valid URI.'
        //     })
        // }).optional()

        image: Joi.object({
            url: Joi.string().uri().allow('', null).messages({
                'string.uri': 'Image URL must be a valid URI.'
            }),
            filename: Joi.string().allow('', null).optional() // Allow empty or null for optional filename
        }).optional(),

        // we are getting coordinates as string in form-data -> parsing it at listing.js(controllers) as array before saving it to database
        coordinates: Joi.string().required(),

        // Getting Object
        // coordinates: Joi.object({
        //     lat: Joi.number().required(),
        //     lng: Joi.number().required(),
        // }).required(),

    }).required()
});

module.exports = { validateListing };


// Server Side Validation of Review
module.exports.validateReview = Joi.object({
    review : Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    
    }).required()
});




// const listingSchema = Joi.object({
//     listing : Joi.object({

//         title: Joi.string().required(),

//         description: Joi.string().required(),

//         price: Joi.number().required().min(0),

//         country: Joi.string().required(),

//         location: Joi.string().required(),

//         image: Joi.object({
//             // filename: Joi.string(),
//             url: Joi.string().allow("", null),
//         }),

        

//     }).required()
// });

// // module.exports  = listingSchema;

