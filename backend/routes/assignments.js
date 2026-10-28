const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');

// GET all assignments
router.get('/', async (req, res) => {
    try {
        const { employee, brand } = req.query;
        const filter = { isActive: true };
        if (employee) filter.employee = employee;
        if (brand) filter.brand = brand;
        const assignments = await Assignment.find(filter)
            .populate('employee', 'name empId')
            .populate('brand', 'name brandCode operationalCalendar assignmentType');
        res.json({ success: true, data: assignments });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST create/update assignment
router.post('/', async (req, res) => {
    try {
        const { employee, brand } = req.body;
        const existing = await Assignment.findOne({ employee, brand });
        if (existing) {
            Object.assign(existing, req.body);
            await existing.save();
            return res.json({ success: true, data: existing });
        }
        const assignment = new Assignment(req.body);
        await assignment.save();
        res.status(201).json({ success: true, data: assignment });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// DELETE assignment
router.delete('/:id', async (req, res) => {
    try {
        await Assignment.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true, message: 'Assignment removed' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
