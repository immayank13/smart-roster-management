const express = require('express');
const router = express.Router();
const RosterEntry = require('../models/RosterEntry');
const { generateRoster, validateRoster } = require('../services/rosterService');

// ─── Generate roster for a month ────────────────────────────────────────────
router.post('/generate', async (req, res) => {
    try {
        const { year, month } = req.body;
        if (!year || !month) return res.status(400).json({ success: false, error: 'year and month required' });
        const result = await generateRoster(parseInt(year), parseInt(month));
        res.json({ success: true, data: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── Validate existing roster ────────────────────────────────────────────────
router.get('/validate', async (req, res) => {
    try {
        const { year, month } = req.query;
        if (!year || !month) return res.status(400).json({ success: false, error: 'year and month required' });
        const violations = await validateRoster(parseInt(year), parseInt(month));
        res.json({ success: true, data: violations, count: violations.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── Company-wide view ───────────────────────────────────────────────────────
router.get('/company-view', async (req, res) => {
    try {
        const { year, month } = req.query;
        const entries = await RosterEntry.find({ year: parseInt(year), month: parseInt(month) })
            .populate('employee', 'name empId role pod')
            .populate('brand', 'name brandCode assignmentType')
            .sort('date');
        res.json({ success: true, data: entries });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── Pod-wise view ───────────────────────────────────────────────────────────
router.get('/pod-view/:podId', async (req, res) => {
    try {
        const { year, month } = req.query;
        const Employee = require('../models/Employee');
        const employees = await Employee.find({ pod: req.params.podId, isActive: true }, '_id');
        const empIds = employees.map(e => e._id);
        const entries = await RosterEntry.find({
            year: parseInt(year), month: parseInt(month),
            employee: { $in: empIds }
        }).populate('employee', 'name empId').populate('brand', 'name brandCode').sort('date');
        res.json({ success: true, data: entries });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── Brand-wise view ─────────────────────────────────────────────────────────
router.get('/brand-view/:brandId', async (req, res) => {
    try {
        const { year, month } = req.query;
        const entries = await RosterEntry.find({
            year: parseInt(year), month: parseInt(month), brand: req.params.brandId
        }).populate('employee', 'name empId').populate('brand', 'name brandCode').sort('date');
        res.json({ success: true, data: entries });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── Process-wise view ───────────────────────────────────────────────────────
router.get('/process-view', async (req, res) => {
    try {
        const { year, month, process } = req.query;
        const filter = { year: parseInt(year), month: parseInt(month) };
        if (process) filter.process = process;
        const entries = await RosterEntry.find(filter)
            .populate('employee', 'name empId')
            .populate('brand', 'name brandCode')
            .sort('date');
        res.json({ success: true, data: entries });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── Employee-wise view ──────────────────────────────────────────────────────
router.get('/employee-view/:empId', async (req, res) => {
    try {
        const { year, month } = req.query;
        const entries = await RosterEntry.find({
            year: parseInt(year), month: parseInt(month), employee: req.params.empId
        }).populate('brand', 'name brandCode operationalCalendar').sort('date');
        res.json({ success: true, data: entries });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── Manual edit a roster entry ──────────────────────────────────────────────
router.put('/entry/:id', async (req, res) => {
    try {
        const entry = await RosterEntry.findByIdAndUpdate(
            req.params.id,
            { ...req.body, isManualEdit: true },
            { new: true }
        );
        if (!entry) return res.status(404).json({ success: false, error: 'Entry not found' });
        res.json({ success: true, data: entry });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// ─── Dashboard summary ───────────────────────────────────────────────────────
router.get('/summary', async (req, res) => {
    try {
        const { year, month } = req.query;
        const filter = { year: parseInt(year), month: parseInt(month) };

        const [total, working, leaves, offs, holidays, conflicts] = await Promise.all([
            RosterEntry.countDocuments(filter),
            RosterEntry.countDocuments({ ...filter, status: 'working' }),
            RosterEntry.countDocuments({ ...filter, status: 'leave' }),
            RosterEntry.countDocuments({ ...filter, status: 'weekly-off' }),
            RosterEntry.countDocuments({ ...filter, status: 'holiday' }),
            RosterEntry.countDocuments({ ...filter, status: 'conflict' })
        ]);

        res.json({
            success: true,
            data: { total, working, leaves, offs, holidays, conflicts }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── Get all conflicts for a month ───────────────────────────────────────────
router.get('/conflicts', async (req, res) => {
    try {
        const { year, month } = req.query;
        const entries = await RosterEntry.find({
            year: parseInt(year), month: parseInt(month),
            'conflicts.0': { $exists: true }
        }).populate('employee', 'name empId').populate('brand', 'name brandCode').sort('date');
        res.json({ success: true, data: entries, count: entries.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
