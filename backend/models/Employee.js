const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  empId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  role: { type: String, enum: ['agent', 'lead', 'manager'], default: 'agent' },
  pod: { type: mongoose.Schema.Types.ObjectId, ref: 'Pod' },
  workingCalendar: {
    type: String,
    enum: ['365', 'mon-sat', 'holidays-off'],
    default: 'mon-sat'
  },
  preferredOffs: [{ type: String }], // e.g. ["Sunday", "Saturday"]
  weeklyOffDay: { type: String, default: 'Sunday' },
  isActive: { type: Boolean, default: true },
  joiningDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
