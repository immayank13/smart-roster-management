const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');

// GET all leaves
router.get('/', async (req, res) => {
    try {
        const { employee, month, year, status } = req.query;
        const filter = {};
        if (employee) filter.employee = employee;
        if (status) filter.status = status;
        if (year && month) {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0, 23, 59, 59);
            filter.$or = [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ];
        }
        const leaves = await Leave.find(filter)
            .populate('employee', 'name empId')
            .sort('-startDate');
        res.json({ success: true, data: leaves });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST create leave
router.post('/', async (req, res) => {
    try {
        const leave = new Leave(req.body);
        await leave.save();
        res.status(201).json({ success: true, data: leave });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// PUT update leave status
router.put('/:id', async (req, res) => {
    try {
        const leave = await Leave.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!leave) return res.status(404).json({ success: false, error: 'Leave not found' });
        res.json({ success: true, data: leave });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// DELETE leave
router.delete('/:id', async (req, res) => {
    try {
        await Leave.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Leave deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
