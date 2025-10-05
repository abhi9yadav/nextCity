// Mongoose Discriminator for 'dept_admin'
// Requires linkage to a specific City and Department.

const User = require('./user');
const mongoose = require('mongoose');

const DeptAdminSchema = new mongoose.Schema({
    // HIERARCHY LINK 1: Must be linked to a specific City
    city_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true
    },
    // HIERARCHY LINK 2: Must be linked to a specific Department
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department', // References the 'Department' model
        required: true
    },
});

// Register the discriminator
const DeptAdmin = User.discriminator('dept_admin', DeptAdminSchema);

module.exports = DeptAdmin;
