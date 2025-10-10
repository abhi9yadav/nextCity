const User = require('./userModel');
const mongoose = require('mongoose');

const DeptAdminSchema = new mongoose.Schema({
    city_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true
    },
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
});

const DeptAdmin = User.discriminator('dept_admin', DeptAdminSchema);

module.exports = DeptAdmin;
