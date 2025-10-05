// Mongoose Model for the 'departments' collection
import mongoose from 'mongoose';

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
    }
}, { timestamps: true });

export default mongoose.model('Department', DepartmentSchema);
