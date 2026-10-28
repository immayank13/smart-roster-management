/**
 * Seeder Script – Smart Roster Management System
 * Run: node backend/seed/seed.js
 *
 * Seeds: 4 Pods, 30 Employees, 25 Brands, Assignments (80/20 rule), Holidays
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Brand = require('../models/Brand');
const Pod = require('../models/Pod');
const Assignment = require('../models/Assignment');
const Holiday = require('../models/Holiday');
const Leave = require('../models/Leave');
const RosterEntry = require('../models/RosterEntry');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-roster';

const PROCESSES = ['CS', 'ACC', 'NDR', 'RTO', 'PREP', 'SOCIAL'];
const CALENDARS = ['365', 'mon-sat', 'holidays-off'];
const CATEGORIES = ['Fashion', 'Electronics', 'Home & Kitchen', 'Beauty', 'Sports', 'Food & Beverage'];

// ─── Pod data ────────────────────────────────────────────────────────────────
const podData = [
    { name: 'Pod Alpha', description: 'Fashion & Lifestyle brands' },
    { name: 'Pod Beta', description: 'Electronics & Tech brands' },
    { name: 'Pod Gamma', description: 'Home & Kitchen brands' },
    { name: 'Pod Delta', description: 'Health, Beauty & Sports brands' }
];

// ─── Employee names ───────────────────────────────────────────────────────────
const employeeNames = [
    'Aarav Sharma', 'Priya Mehta', 'Rohit Verma', 'Sneha Patel', 'Karan Singh',
    'Ananya Nair', 'Vikram Joshi', 'Pooja Gupta', 'Arjun Kumar', 'Divya Reddy',
    'Nikhil Desai', 'Shreya Banerjee', 'Aditya Rao', 'Kavya Pillai', 'Manish Tiwari',
    'Riya Malhotra', 'Suresh Iyer', 'Nisha Chauhan', 'Rahul Bose', 'Meera Kapoor',
    'Tarun Saxena', 'Ankita Srivastava', 'Dev Chaturvedi', 'Pallavi Mishra', 'Gaurav Pandey',
    'Simran Kaur', 'Varun Agarwal', 'Tejal Shah', 'Prakash Nagar', 'Swati Dubey'
];

// ─── Brand data ───────────────────────────────────────────────────────────────
const brandNames = [
    { name: 'UrbanStyle', category: 'Fashion', processes: ['CS', 'NDR', 'RTO'] },
    { name: 'TechNova', category: 'Electronics', processes: ['CS', 'ACC'] },
    { name: 'HomeEssentials', category: 'Home & Kitchen', processes: ['CS', 'NDR'] },
    { name: 'GlowSkin', category: 'Beauty', processes: ['CS', 'SOCIAL'] },
    { name: 'FitGear', category: 'Sports', processes: ['CS', 'ACC', 'NDR'] },
    { name: 'FreshBite', category: 'Food & Beverage', processes: ['CS', 'PREP'] },
    { name: 'DenimCo', category: 'Fashion', processes: ['CS', 'NDR'] },
    { name: 'GadgetHub', category: 'Electronics', processes: ['CS', 'ACC', 'RTO'] },
    { name: 'KitchenPro', category: 'Home & Kitchen', processes: ['CS'] },
    { name: 'NaturalGlow', category: 'Beauty', processes: ['CS', 'SOCIAL', 'ACC'] },
    { name: 'RunnerX', category: 'Sports', processes: ['CS', 'NDR', 'RTO'] },
    { name: 'OrganicFarm', category: 'Food & Beverage', processes: ['CS', 'PREP', 'NDR'] },
    { name: 'ThreadWorks', category: 'Fashion', processes: ['CS', 'ACC'] },
    { name: 'SmartGadgets', category: 'Electronics', processes: ['CS', 'NDR'] },
    { name: 'CozyHome', category: 'Home & Kitchen', processes: ['CS', 'SOCIAL'] },
    { name: 'PureSkin', category: 'Beauty', processes: ['CS'] },
    { name: 'YogaZen', category: 'Sports', processes: ['CS', 'ACC'] },
    { name: 'TeaTime', category: 'Food & Beverage', processes: ['CS', 'RTO'] },
    { name: 'StyleHub', category: 'Fashion', processes: ['CS', 'NDR', 'ACC'] },
    { name: 'AudioPeak', category: 'Electronics', processes: ['CS', 'RTO', 'NDR'] },
    { name: 'HomeDecor', category: 'Home & Kitchen', processes: ['CS', 'NDR'] },
    { name: 'HerbalCare', category: 'Beauty', processes: ['CS', 'SOCIAL'] },
    { name: 'OutdoorLife', category: 'Sports', processes: ['CS', 'ACC', 'NDR'] },
    { name: 'SpiceRoute', category: 'Food & Beverage', processes: ['CS', 'PREP'] },
    { name: 'ModernKart', category: 'Fashion', processes: ['CS', 'ACC', 'NDR', 'RTO'] }
];

// ─── 2026 Indian Public Holidays ─────────────────────────────────────────────
const holidays2026 = [
    { date: '2026-01-26', name: 'Republic Day', type: 'national', year: 2026 },
    { date: '2026-03-05', name: 'Holi', type: 'national', year: 2026 },
    { date: '2026-04-02', name: 'Ram Navami', type: 'national', year: 2026 },
    { date: '2026-04-14', name: 'Ambedkar Jayanti', type: 'national', year: 2026 },
    { date: '2026-05-01', name: 'Labour Day', type: 'national', year: 2026 },
    { date: '2026-08-15', name: 'Independence Day', type: 'national', year: 2026 },
    { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'national', year: 2026 },
    { date: '2026-10-20', name: 'Diwali', type: 'national', year: 2026 },
    { date: '2026-10-21', name: 'Diwali (Day 2)', type: 'national', year: 2026 },
    { date: '2026-11-08', name: 'Guru Nanak Jayanti', type: 'national', year: 2026 },
    { date: '2026-12-25', name: 'Christmas', type: 'national', year: 2026 }
];

function randomElem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomSubset(arr, min = 1, max = 3) {
    const count = min + Math.floor(Math.random() * (max - min + 1));
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
        Employee.deleteMany({}),
        Brand.deleteMany({}),
        Pod.deleteMany({}),
        Assignment.deleteMany({}),
        Holiday.deleteMany({}),
        Leave.deleteMany({}),
        RosterEntry.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // ─── Create Pods ──────────────────────────────────────────────────────────
    const pods = await Pod.insertMany(podData);
    console.log(`✅ Created ${pods.length} pods`);

    // ─── Create Employees ─────────────────────────────────────────────────────
    const employeeDocs = employeeNames.map((name, i) => {
        const pod = pods[Math.floor(i / (employeeNames.length / pods.length))];
        const isLead = i % 7 === 0; // Every 7th employee is a lead
        return {
            empId: `EMP${String(i + 1).padStart(3, '0')}`,
            name,
            email: name.toLowerCase().replace(/\s+/g, '.') + '@datastraw.com',
            phone: `98${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
            role: isLead ? 'lead' : 'agent',
            pod: pod._id,
            workingCalendar: randomElem(CALENDARS),
            weeklyOffDay: 'Sunday',
            isActive: true,
            joiningDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        };
    });

    const employees = await Employee.insertMany(employeeDocs);
    console.log(`✅ Created ${employees.length} employees`);

    // Assign leads to pods
    for (let i = 0; i < pods.length; i++) {
        const leadEmp = employees.find(e => e.pod.toString() === pods[i]._id.toString() && e.role === 'lead');
        if (leadEmp) {
            await Pod.findByIdAndUpdate(pods[i]._id, { lead: leadEmp._id });
        }
    }

    // ─── Create Brands ────────────────────────────────────────────────────────
    const brandDocs = brandNames.map((b, i) => ({
        brandCode: `BRD${String(i + 1).padStart(3, '0')}`,
        name: b.name,
        category: b.category,
        operationalCalendar: randomElem(CALENDARS),
        assignmentType: i < 20 ? 'dedicated' : 'shared', // ~80% dedicated
        pod: pods[i % pods.length]._id,
        processes: b.processes,
        isActive: true
    }));

    const brands = await Brand.insertMany(brandDocs);
    console.log(`✅ Created ${brands.length} brands`);

    // ─── Create Assignments (80/20 Rule) ─────────────────────────────────────
    const assignmentDocs = [];

    // 80% dedicated brands: 1 dedicated employee, all processes
    const dedicatedBrands = brands.filter(b => b.assignmentType === 'dedicated');
    const sharedBrands = brands.filter(b => b.assignmentType === 'shared');

    // Shuffle employees for fair distribution
    const shuffledEmployees = [...employees].sort(() => 0.5 - Math.random());

    dedicatedBrands.forEach((brand, i) => {
        const emp = shuffledEmployees[i % shuffledEmployees.length];
        assignmentDocs.push({
            employee: emp._id,
            brand: brand._id,
            processes: brand.processes,
            assignmentType: 'dedicated',
            isPrimary: true,
            isActive: true
        });
    });

    // 20% shared brands: 2-3 employees, sometimes split by process
    sharedBrands.forEach(brand => {
        const numEmployees = 2 + Math.floor(Math.random() * 2); // 2 or 3
        const selectedEmps = randomSubset(shuffledEmployees, numEmployees, numEmployees);
        selectedEmps.forEach((emp, idx) => {
            assignmentDocs.push({
                employee: emp._id,
                brand: brand._id,
                processes: idx === 0 ? brand.processes : randomSubset(brand.processes),
                assignmentType: 'shared',
                isPrimary: idx === 0,
                isActive: true
            });
        });
    });

    // Deduplicate by employee+brand
    const seen = new Set();
    const uniqueAssignments = assignmentDocs.filter(a => {
        const key = `${a.employee}-${a.brand}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    await Assignment.insertMany(uniqueAssignments);
    console.log(`✅ Created ${uniqueAssignments.length} assignments`);

    // ─── Create Holidays ──────────────────────────────────────────────────────
    await Holiday.insertMany(holidays2026);
    console.log(`✅ Created ${holidays2026.length} holidays`);

    // ─── Create Sample Leaves (current month: Oct 2026) ──────────────────────
    const leaveTypes = ['PL', 'SL', 'CL'];
    const sampleLeaves = [];

    for (let i = 0; i < 15; i++) {
        const emp = randomElem(employees);
        const startDay = 1 + Math.floor(Math.random() * 25);
        const duration = 1 + Math.floor(Math.random() * 3);
        sampleLeaves.push({
            employee: emp._id,
            startDate: new Date(2026, 9, startDay), // Oct 2026
            endDate: new Date(2026, 9, Math.min(startDay + duration - 1, 31)),
            leaveType: randomElem(leaveTypes),
            reason: 'Sample leave for demonstration',
            status: 'approved'
        });
    }
    await Leave.insertMany(sampleLeaves);
    console.log(`✅ Created ${sampleLeaves.length} sample leaves`);

    console.log('\n🎉 Seeding complete! The database is ready.');
    console.log('📊 Summary:');
    console.log(`   Pods: ${pods.length}`);
    console.log(`   Employees: ${employees.length}`);
    console.log(`   Brands: ${brands.length} (${dedicatedBrands.length} dedicated / ${sharedBrands.length} shared)`);
    console.log(`   Assignments: ${uniqueAssignments.length}`);
    console.log(`   Holidays: ${holidays2026.length}`);
    console.log(`   Sample Leaves: ${sampleLeaves.length}`);

    await mongoose.connection.close();
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
