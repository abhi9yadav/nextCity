const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
    department_name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        maxlength: 250
    },
    photoURL: {
        type: String 
    }
}, { timestamps: true });

module.exports = mongoose.model('Department', DepartmentSchema);
