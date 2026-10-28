const express = require('express');
const router = express.Router();
const Holiday = require('../models/Holiday');

// GET holidays  
router.get('/', async (req, res) => {
    try {
        const { year } = req.query;
        const filter = {};
        if (year) filter.year = parseInt(year);
        const holidays = await Holiday.find(filter).sort('date');
        res.json({ success: true, data: holidays });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST create holiday
router.post('/', async (req, res) => {
    try {
        const holiday = new Holiday(req.body);
        await holiday.save();
        res.status(201).json({ success: true, data: holiday });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// DELETE holiday
router.delete('/:id', async (req, res) => {
    try {
        await Holiday.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Holiday deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
