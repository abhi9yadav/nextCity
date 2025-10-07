// Mongoose Discriminator for 'worker'
// Requires linkage to a City, Department, and specific Zone.

const User = require('./userModel');
const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
    // HIERARCHY LINK 1: Must be linked to a specific City
    city_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true
    },
    // HIERARCHY LINK 2: Must be linked to a specific Department
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    // HIERARCHY LINK 3: Must be linked to a specific Zone (the worker's area of operation)
    zone_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Zone', // References the 'Zone' model
        required: true
    },
});

// Register the discriminator
const Worker = User.discriminator('worker', WorkerSchema);

module.exports = Worker;
