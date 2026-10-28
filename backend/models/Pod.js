const mongoose = require('mongoose');

const podSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Pod', podSchema);
