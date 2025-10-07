// Mongoose Model for the 'departments' collection
const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
    // Primary Key: MongoDB automatically creates _id
    department_name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // A brief description of the department's function (e.g., "Road Maintenance", "Waste Management")
    description: {
        type: String,
        maxlength: 250
    },
    photoURL: {
        type: String 
    }
}, { timestamps: true });

module.exports = mongoose.model('Department', DepartmentSchema);
