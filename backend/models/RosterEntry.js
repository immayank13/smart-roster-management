const mongoose = require('mongoose');

const rosterEntrySchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    process: { type: String }, // CS, ACC, NDR, etc.
    date: { type: Date, required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true }, // 1-12
    status: {
        type: String,
        enum: ['working', 'weekly-off', 'leave', 'holiday', 'conflict', 'unassigned'],
        default: 'working'
    },
    isManualEdit: { type: Boolean, default: false },
    conflicts: [{
        type: { type: String },       // 'coverage-gap', 'no-backup', 'leave-conflict'
        message: { type: String },
        severity: { type: String, enum: ['error', 'warning'], default: 'error' }
    }],
    notes: { type: String }
}, { timestamps: true });

rosterEntrySchema.index({ employee: 1, date: 1 });
rosterEntrySchema.index({ year: 1, month: 1 });
rosterEntrySchema.index({ brand: 1, date: 1 });

module.exports = mongoose.model('RosterEntry', rosterEntrySchema);
