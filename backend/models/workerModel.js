const User = require('./userModel');
const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
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
    zone_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Zone',
        required: true
    },
});

const Worker = User.discriminator('worker', WorkerSchema);

module.exports = Worker;
