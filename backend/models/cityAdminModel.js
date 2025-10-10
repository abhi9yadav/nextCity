const User = require('./userModel');
const mongoose = require('mongoose');

const CityAdminSchema = new mongoose.Schema({
    city_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true
    },
});

const CityAdmin = User.discriminator('city_admin', CityAdminSchema);

module.exports = CityAdmin;
