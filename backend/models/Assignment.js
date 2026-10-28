const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    processes: [{ type: String }], // ["CS", "ACC", "NDR"]
    assignmentType: { type: String, enum: ['dedicated', 'shared'], default: 'dedicated' },
    isPrimary: { type: Boolean, default: true }, // primary handler for brand
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Compound index: one employee can have multiple brand assignments
assignmentSchema.index({ employee: 1, brand: 1 }, { unique: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
