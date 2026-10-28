# Smart Roster Management System - Architecture

## Tech Stack
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (via Mongoose)
- **Frontend**: HTML5 + CSS3 + Bootstrap 5 + Vanilla JS

## Project Structure
```
smart-roster/
├── backend/
│   ├── models/         # Mongoose models
│   ├── routes/         # Express route handlers
│   ├── services/       # Business logic (roster generation, conflict detection)
│   ├── seed/           # DB seeder scripts
│   └── server.js       # Entry point
├── frontend/
│   ├── index.html      # Dashboard
│   ├── roster.html     # Roster views
│   ├── employees.html  # Employee management
│   ├── brands.html     # Brand management
│   ├── leaves.html     # Leave management
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js      # API client
│       ├── dashboard.js
│       ├── roster.js
│       └── ...
└── package.json
```

## Data Model Overview

### Employee
- name, empId, pod, role (agent/lead)
- workingCalendar (365/Mon-Sat/Public-Holidays-Off)
- preferredOffs

### Brand
- name, brandCode, operationalCalendar (365/Mon-Sat/Holidays-Off)
- assignmentType (dedicated/shared)

### Process
- name (CS, ACC, NDR, etc.), brand

### Assignment
- employee → brand → [processes]
- type: dedicated (80%) or shared (20%)

### Leave
- employee, date, type (PL/SL/CL)

### Holiday
- date, name, type (national/regional)

### Roster Entry
- employee, brand, process, date, status (working/off/leave/holiday/conflict)
- conflictReason (if any)

## Conflict Detection Rules
1. Employee on leave but brand needs 365-day coverage → FLAG
2. Employee on weekly off but brand operates that day → FLAG
3. Brand has no coverage (dedicated employee absent) → FLAG
4. Overlapping assignments causing >8h workload → FLAG
