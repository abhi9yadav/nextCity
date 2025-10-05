// Mongoose Discriminator for 'city_admin'
// Requires linkage to a specific City.

const User = require('./user');
const mongoose = require('mongoose');

// Ensure other models are available for referencing
// Note: We don't need to 'require' the models if they are already registered in Mongoose,
// but explicitly importing them clarifies the reference dependency.
// const City = require('./City');

const CityAdminSchema = new mongoose.Schema({
    // HIERARCHY LINK: Must be linked to a specific City
    city_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City', // References the 'City' model (which we created in the last step)
        required: true
    },
});

// Register the discriminator
const CityAdmin = User.discriminator('city_admin', CityAdminSchema);

module.exports = CityAdmin;
