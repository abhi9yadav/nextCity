const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
        city_name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    country: {
        type: String,
        default: 'India'
    }
}, { timestamps: true });

module.exports = mongoose.model('City', CitySchema);
