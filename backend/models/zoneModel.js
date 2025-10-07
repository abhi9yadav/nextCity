// Mongoose Model for the 'zones' collection
// This model uses GeoJSON for geographical boundary storage, optimized for Leaflet integration.
const mongoose = require('mongoose');

const ZoneSchema = new mongoose.Schema({
    // Primary Key: MongoDB automatically creates _id
    zone_name: {
        type: String,
        required: true,
        trim: true
    },

    // Foreign Key Reference to City (Mandatory linkage)
    city_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true
    },

    // Foreign Key Reference to Department (Mandatory linkage)
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },

    // GeoJSON structure for geographical boundary (Polygon or MultiPolygon)
    // This allows us to query for complaints within a specific zone efficiently.
    geographical_boundary: {
        type: {
            type: String,
            enum: ['Polygon'], // We enforce that the boundaries must be defined as polygons
            required: true
        },
        // Coordinates for the GeoJSON polygon, in format: [[[lng, lat], [lng, lat], ...]]
        coordinates: {
            type: [[[Number]]],
            required: true
        }
    }
}, { timestamps: true });

// Create a 2dsphere index for geospatial queries (crucial for mapping and location-based searches)
ZoneSchema.index({ geographical_boundary: '2dsphere' });

modules.exports = mongoose.model('Zone', ZoneSchema);
