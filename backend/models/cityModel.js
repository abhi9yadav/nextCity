// Mongoose Model for the 'cities' collection
const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
    // Primary Key: MongoDB automatically creates _id
    city_name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // Future field for linking to larger administrative units if needed
    country: {
        type: String,
        default: 'India' // Assuming a default context
    }
}, { timestamps: true });

module.exports = mongoose.model('City', CitySchema);
