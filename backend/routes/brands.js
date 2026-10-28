const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');

// GET all brands
router.get('/', async (req, res) => {
    try {
        const { assignmentType, pod } = req.query;
        const filter = { isActive: true };
        if (assignmentType) filter.assignmentType = assignmentType;
        if (pod) filter.pod = pod;
        const brands = await Brand.find(filter).populate('pod', 'name').sort('name');
        res.json({ success: true, data: brands });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET single brand
router.get('/:id', async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id).populate('pod');
        if (!brand) return res.status(404).json({ success: false, error: 'Brand not found' });
        res.json({ success: true, data: brand });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST create brand
router.post('/', async (req, res) => {
    try {
        const brand = new Brand(req.body);
        await brand.save();
        res.status(201).json({ success: true, data: brand });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// PUT update brand
router.put('/:id', async (req, res) => {
    try {
        const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!brand) return res.status(404).json({ success: false, error: 'Brand not found' });
        res.json({ success: true, data: brand });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// DELETE brand
router.delete('/:id', async (req, res) => {
    try {
        await Brand.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true, message: 'Brand deactivated' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
