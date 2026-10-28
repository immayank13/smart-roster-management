/**
 * RosterService: Core business logic for generating rosters and detecting conflicts.
 */

const Employee = require('../models/Employee');
const Brand = require('../models/Brand');
const Assignment = require('../models/Assignment');
const Leave = require('../models/Leave');
const Holiday = require('../models/Holiday');
const RosterEntry = require('../models/RosterEntry');

// ────────────────────────────────────────────
// HELPER: Get all dates in a month
// ────────────────────────────────────────────
function getDatesInMonth(year, month) {
    const dates = [];
    const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-indexed here
    for (let d = 1; d <= daysInMonth; d++) {
        dates.push(new Date(year, month - 1, d));
    }
    return dates;
}

// ────────────────────────────────────────────
// HELPER: Get day name
// ────────────────────────────────────────────
function getDayName(date) {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
}

// ────────────────────────────────────────────
// HELPER: Check if a date is a holiday
// ────────────────────────────────────────────
function isHoliday(date, holidays) {
    return holidays.some(h => {
        const hd = new Date(h.date);
        return hd.getFullYear() === date.getFullYear() &&
            hd.getMonth() === date.getMonth() &&
            hd.getDate() === date.getDate();
    });
}

// ────────────────────────────────────────────
// HELPER: Check if employee is on leave on date
// ────────────────────────────────────────────
function isOnLeave(date, leaves) {
    return leaves.find(l => {
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end && l.status === 'approved';
    });
}

// ────────────────────────────────────────────
// HELPER: Is this date a working day for an employee?
// ────────────────────────────────────────────
function isEmployeeWorkingDay(date, employee, holidays) {
    const day = getDayName(date);
    switch (employee.workingCalendar) {
        case '365':
            return { working: true };
        case 'mon-sat':
            if (day === 'Sunday') return { working: false, reason: 'Weekly Off (Sunday)' };
            return { working: true };
        case 'holidays-off':
            if (day === 'Sunday') return { working: false, reason: 'Weekly Off (Sunday)' };
            if (isHoliday(date, holidays)) return { working: false, reason: 'Public Holiday' };
            return { working: true };
        default:
            return { working: true };
    }
}

// ────────────────────────────────────────────
// HELPER: Does the brand operate on this date?
// ────────────────────────────────────────────
function isBrandOperating(date, brand, holidays) {
    const day = getDayName(date);
    switch (brand.operationalCalendar) {
        case '365':
            return true;
        case 'mon-sat':
            return day !== 'Sunday';
        case 'holidays-off':
            return day !== 'Sunday' && !isHoliday(date, holidays);
        default:
            return true;
    }
}

// ────────────────────────────────────────────
// MAIN: Generate roster for a given month
// ────────────────────────────────────────────
async function generateRoster(year, month) {
    // 1. Load all needed data
    const [employees, brands, assignments, holidays] = await Promise.all([
        Employee.find({ isActive: true }),
        Brand.find({ isActive: true }),
        Assignment.find({ isActive: true }).populate('employee brand'),
        Holiday.find({ year })
    ]);

    // Load approved leaves for this month
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59);
    const leaves = await Leave.find({
        status: 'approved',
        $or: [
            { startDate: { $lte: monthEnd }, endDate: { $gte: monthStart } }
        ]
    });

    const dates = getDatesInMonth(year, month);
    const entries = [];
    const conflicts = [];

    // Build lookup maps
    const leaveByEmployee = {};
    leaves.forEach(l => {
        const empId = l.employee.toString();
        if (!leaveByEmployee[empId]) leaveByEmployee[empId] = [];
        leaveByEmployee[empId].push(l);
    });

    const assignmentsByEmployee = {};
    const assignmentsByBrand = {};
    assignments.forEach(a => {
        if (!a.employee || !a.brand) return;
        const empId = a.employee._id.toString();
        const brandId = a.brand._id.toString();
        if (!assignmentsByEmployee[empId]) assignmentsByEmployee[empId] = [];
        if (!assignmentsByBrand[brandId]) assignmentsByBrand[brandId] = [];
        assignmentsByEmployee[empId].push(a);
        assignmentsByBrand[brandId].push(a);
    });

    // 2. For each date, compute each employee's status
    for (const date of dates) {
        for (const employee of employees) {
            const empId = employee._id.toString();
            const empLeaves = leaveByEmployee[empId] || [];
            const empAssignments = assignmentsByEmployee[empId] || [];

            const leaveRecord = isOnLeave(date, empLeaves);
            const workCheck = isEmployeeWorkingDay(date, employee, holidays);

            let status = 'working';
            let entryConflicts = [];
            let notes = '';

            if (leaveRecord) {
                status = 'leave';
                notes = `${leaveRecord.leaveType} Leave`;
            } else if (!workCheck.working) {
                status = workCheck.reason.includes('Holiday') ? 'holiday' : 'weekly-off';
                notes = workCheck.reason;
            }

            // For each brand assignment, check if there's a conflict
            for (const assign of empAssignments) {
                if (!assign.brand) continue;
                const brand = assign.brand;
                const brandOperates = isBrandOperating(date, brand, holidays);

                if (brandOperates) {
                    if (leaveRecord) {
                        // Brand needs coverage but employee is on leave
                        const conflict = {
                            type: 'leave-conflict',
                            message: `Coverage Gap: ${brand.name} needs ${assign.processes.join('/')} on ${getDayName(date)} ${date.toDateString()}, but ${employee.name} is on ${leaveRecord.leaveType} Leave`,
                            severity: 'error',
                            date,
                            employee: employee._id,
                            brand: brand._id
                        };
                        entryConflicts.push(conflict);
                        conflicts.push(conflict);
                    } else if (!workCheck.working) {
                        // Brand needs coverage but employee is off
                        const conflict = {
                            type: 'coverage-gap',
                            message: `Coverage Gap: ${brand.name} operates on ${getDayName(date)} (${brand.operationalCalendar}), but ${employee.name} has ${workCheck.reason}`,
                            severity: workCheck.reason.includes('Holiday') ? 'warning' : 'error',
                            date,
                            employee: employee._id,
                            brand: brand._id
                        };
                        entryConflicts.push(conflict);
                        conflicts.push(conflict);
                    }
                }
            }

            if (entryConflicts.length > 0 && status !== 'leave' && status !== 'weekly-off' && status !== 'holiday') {
                status = 'conflict';
            }

            // Create entry per assignment, or a single "unassigned" entry if no assignments
            if (empAssignments.length === 0) {
                entries.push({
                    employee: employee._id,
                    brand: null,
                    process: null,
                    date,
                    year,
                    month,
                    status: status === 'working' ? 'unassigned' : status,
                    conflicts: entryConflicts,
                    notes,
                    isManualEdit: false
                });
            } else {
                for (const assign of empAssignments) {
                    const brand = assign.brand;
                    if (!brand) continue;
                    const brandOperates = isBrandOperating(date, brand, holidays);

                    let entryStatus = status;
                    if (status === 'working' && !brandOperates) {
                        entryStatus = 'working'; // employee works, brand is closed (no shift needed)
                    }

                    for (const process of assign.processes) {
                        entries.push({
                            employee: employee._id,
                            brand: brand._id,
                            process,
                            date,
                            year,
                            month,
                            status: entryStatus,
                            conflicts: entryConflicts,
                            notes,
                            isManualEdit: false
                        });
                    }
                }
            }
        }
    }

    // 3. Delete old generated (non-manual) entries for this month
    await RosterEntry.deleteMany({ year, month, isManualEdit: false });

    // 4. Bulk insert new entries
    const inserted = await RosterEntry.insertMany(entries);

    return {
        generated: inserted.length,
        conflicts: conflicts.length,
        conflictDetails: conflicts.map(c => ({
            type: c.type,
            message: c.message,
            severity: c.severity,
            date: c.date
        }))
    };
}

// ────────────────────────────────────────────
// Validate an existing roster for conflicts
// ────────────────────────────────────────────
async function validateRoster(year, month) {
    const holidays = await Holiday.find({ year });
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59);
    const leaves = await Leave.find({
        status: 'approved',
        startDate: { $lte: monthEnd },
        endDate: { $gte: monthStart }
    });

    const entries = await RosterEntry.find({ year, month })
        .populate('employee brand');

    const violations = [];

    for (const entry of entries) {
        if (!entry.employee || !entry.brand) continue;
        const leaveRecord = isOnLeave(entry.date, leaves.filter(l => l.employee.toString() === entry.employee._id.toString()));
        const brandOperates = isBrandOperating(entry.date, entry.brand, holidays);
        const workCheck = isEmployeeWorkingDay(entry.date, entry.employee, holidays);

        if (entry.status === 'working' && leaveRecord) {
            violations.push({
                type: 'leave-conflict',
                message: `${entry.employee.name} is marked working for ${entry.brand.name} but is on ${leaveRecord.leaveType} Leave`,
                date: entry.date,
                severity: 'error'
            });
        }

        if (entry.status === 'working' && !workCheck.working) {
            violations.push({
                type: 'off-day-conflict',
                message: `${entry.employee.name} is marked working for ${entry.brand.name} on their ${workCheck.reason}`,
                date: entry.date,
                severity: 'warning'
            });
        }

        if (entry.status !== 'working' && brandOperates && entry.brand.assignmentType === 'dedicated') {
            violations.push({
                type: 'coverage-gap',
                message: `${entry.brand.name} operates today but ${entry.employee.name} is ${entry.status}. No dedicated coverage.`,
                date: entry.date,
                severity: 'error'
            });
        }
    }

    return violations;
}

module.exports = { generateRoster, validateRoster, getDatesInMonth, isHoliday, isOnLeave };
