const express = require('express');
const router = express.Router();
const Pod = require('../models/Pod');
const Employee = require('../models/Employee');

// GET all pods
router.get('/', async (req, res) => {
    try {
        const pods = await Pod.find({ isActive: true }).populate('lead', 'name empId');
        res.json({ success: true, data: pods });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET single pod
router.get('/:id', async (req, res) => {
    try {
        const pod = await Pod.findById(req.params.id).populate('lead');
        if (!pod) return res.status(404).json({ success: false, error: 'Not found' });
        res.json({ success: true, data: pod });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST create pod
router.post('/', async (req, res) => {
    try {
        const pod = new Pod(req.body);
        await pod.save();
        res.status(201).json({ success: true, data: pod });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// PUT update pod
router.put('/:id', async (req, res) => {
    try {
        const pod = await Pod.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: pod });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;
