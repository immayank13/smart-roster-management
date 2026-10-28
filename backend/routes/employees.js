const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Pod = require('../models/Pod');

// GET all employees
router.get('/', async (req, res) => {
    try {
        const { pod, role, isActive } = req.query;
        const filter = {};
        if (pod) filter.pod = pod;
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        const employees = await Employee.find(filter).populate('pod', 'name').sort('name');
        res.json({ success: true, data: employees });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET single employee
router.get('/:id', async (req, res) => {
    try {
        const emp = await Employee.findById(req.params.id).populate('pod');
        if (!emp) return res.status(404).json({ success: false, error: 'Employee not found' });
        res.json({ success: true, data: emp });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST create employee
router.post('/', async (req, res) => {
    try {
        const emp = new Employee(req.body);
        await emp.save();
        res.status(201).json({ success: true, data: emp });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// PUT update employee
router.put('/:id', async (req, res) => {
    try {
        const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!emp) return res.status(404).json({ success: false, error: 'Employee not found' });
        res.json({ success: true, data: emp });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// DELETE employee
router.delete('/:id', async (req, res) => {
    try {
        await Employee.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true, message: 'Employee deactivated' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
