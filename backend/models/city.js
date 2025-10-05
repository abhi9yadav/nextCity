// Mongoose Model for the 'cities' collection
import mongoose from 'mongoose';

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

export default mongoose.model('City', CitySchema);
