const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    brandCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String }, // e.g. "Fashion", "Electronics"
    operationalCalendar: {
        type: String,
        enum: ['365', 'mon-sat', 'holidays-off'],
        default: 'mon-sat'
    },
    assignmentType: {
        type: String,
        enum: ['dedicated', 'shared'],
        default: 'dedicated'
    },
    pod: { type: mongoose.Schema.Types.ObjectId, ref: 'Pod' },
    processes: [{ type: String }], // e.g. ["CS", "ACC", "NDR"]
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Brand', brandSchema);
