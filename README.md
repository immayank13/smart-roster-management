# 🚀 Smart Roster Management System - Quick Start Guide

## Prerequisites

Before running this app, you need **MongoDB**. Choose one option:

---

## Option A: MongoDB Atlas (FREE - Recommended for quick start)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account and click **Build a Database** → choose **M0 Free Tier**
3. Create a user (e.g., `rosteradmin` / `yourpassword123`)
4. Under **Network Access**, click **Add IP Address** → **Allow Access From Anywhere** (0.0.0.0/0)
5. Click **Connect** → **Drivers** → copy the connection string  
   It looks like: `mongodb+srv://rosteradmin:yourpassword123@cluster0.xxxxx.mongodb.net/smart-roster`
6. Open the `.env` file in the project root and update:
   ```
   MONGO_URI=mongodb+srv://rosteradmin:yourpassword123@cluster0.xxxxx.mongodb.net/smart-roster
   ```

---

## Option B: Install MongoDB Locally (Windows)

1. Download MongoDB Community from: https://www.mongodb.com/try/download/community
2. Run the installer (choose "Complete" install)
3. MongoDB runs as a Windows Service automatically
4. Your `.env` stays as: `MONGO_URI=mongodb://localhost:27017/smart-roster`

---

## Running the App

Once MongoDB is ready (Atlas or Local):

### Step 1: Seed the Database (first time only)
```bash
npm run seed
```
This creates 30 employees, 25 brands, 4 pods, assignments (80/20 rule), holidays, and sample leaves.

### Step 2: Start the Server
```bash
npm start
```
Open your browser: **http://localhost:5000**

### Step 3: Generate Roster
1. On the Dashboard, select **October 2026**
2. Click **⚡ Generate Roster**
3. Go to **Roster** page to view the calendar grid
4. Conflicts auto-detected — check the **Conflicts** page

---

## Key Workflows

| Page | What to do |
|------|-----------|
| Dashboard | Overview + Generate Roster |
| Roster | View by Company / Pod / Brand / Process / Employee |
| Conflicts | See all scheduling conflicts |
| Employees | Add/Edit 30+ employees |
| Brands | Manage brands with operational calendars |
| Pods | Manage pods and pod leads |
| Assignments | Link employees to brands + processes |
| Leaves | Add/approve leaves (triggers conflict detection) |
| Holidays | Manage public holidays |

---

## Conflict Detection Logic

The system flags (never silently accepts):
- 🚨 **Leave Conflict**: Employee is on leave but brand needs 365-day coverage
- 🚨 **Coverage Gap**: Employee is on weekly off but brand operates that day
- ⚠️ **Off-day Conflict**: Employee marked working on their weekly off

After any change (leave, manual edit), click **🔍 Validate** on the Roster page.

---

## 💡 Tell Us How You Think

### 1. How did you model employees, brands, processes, pods, and their relationships?

Each entity is a separate **MongoDB collection** with references (ObjectIds) connecting them:

- **Employee** stores personal info, weekly off day, and which pod they belong to.
- **Brand** stores its name, operational calendar (e.g., Mon–Fri, or 365 days), and whether it's a "dedicated" or "shared" brand under the 80/20 rule.
- **Process** is embedded within a Brand (e.g., Chat, Email, Voice) — each process has its own coverage requirement.
- **Pod** groups employees together under a pod lead.
- **Assignment** is the linking table — it connects an Employee → Brand → Process, and flags whether it's a primary (80%) or shared (20%) assignment.

This normalized structure lets us query from any direction: "Which brands does this employee handle?" or "Who covers this brand's chat process today?"

---

### 2. How does your system generate a roster and determine whether it satisfies the required constraints?

The **roster generation** (`/api/roster/generate`) works as follows:

1. For each day in the selected month, fetch all assignments.
2. For each assignment, check if the employee is on **approved leave** or on their **weekly off** that day.
3. Also check if the brand **operates** on that day (based on its operational calendar).
4. Generate a `RosterEntry` document for every employee × day combination with status: `working`, `leave`, or `off`.

**Constraint validation** runs separately via `/api/roster/conflicts`:
- If a brand requires 365-day coverage and its assigned employee is on leave → 🚨 **Leave Conflict**
- If the brand operates on a day that's the employee's weekly off → 🚨 **Coverage Gap**
- System never auto-resolves — it flags and surfaces every conflict for human review.

---

### 3. How did you handle the difference between single-resource brands and brands with multiple employees?

Brands have a `coverageType` field — either `dedicated` (one primary employee) or `shared` (multiple employees, at least one must be available on any given day).

- **Single-resource brands**: If that one employee is unavailable, an immediate conflict is raised — no fallback exists, and a manager must act.
- **Multi-employee brands**: The system checks if **at least one** assigned employee is available. If all are simultaneously on leave → conflict raised. The conflict message lists all unavailable employees so the manager knows the severity.

---

### 4. What happens when an employee manages all processes for a brand but is unavailable on a required working day?

The system detects this as a **critical Leave Conflict**. It:
1. Flags every process under that brand as "uncovered" for that day.
2. Raises a conflict entry with severity `HIGH`.
3. Displays it prominently in the Conflicts page with the affected brand, date, and employee name.
4. Does **not** auto-assign a replacement — roster editing is kept under human control so managers can deliberately decide who covers.

---

### 5. How does your system handle conflicting requirements or insufficient staffing?

The system follows a **flag-and-surface** strategy rather than auto-resolving:

- All conflicts are stored in the database with type, severity, affected brand/employee/date.
- The Conflicts page gives a full audit trail.
- Manual roster editing allows managers to override assignments for specific days.
- There is no silent failure — if a constraint can't be met, the conflict is always visible.

This was a deliberate trade-off: auto-resolution risks making wrong staffing decisions; human oversight is safer for operations.

---

### 6. Which parts of the process did you automate, and which did you leave under human control? Why?

| Automated ✅ | Human Control 🧑‍💼 |
|---|---|
| Monthly roster generation | Approving/rejecting leaves |
| Conflict detection & flagging | Resolving conflicts (manual override) |
| Database seeding (30 employees, 25 brands) | Adding new employees or brands |
| Weekly-off & holiday checking | Changing assignment rules |

**Why?** Automation handles the repetitive, rule-based work. But roster decisions affect real people's work schedules and brand SLAs — these decisions carry accountability that should stay with a human manager, not an algorithm.

---

### 7. If the company doubled its team and brand count, what would you change about your solution?

With 60+ employees and 50+ brands:

1. **Caching**: Add Redis to cache generated rosters — regenerating from scratch for 60 employees × 31 days × 50 brands is expensive.
2. **Background Jobs**: Move roster generation to a background queue (Bull/BullMQ) instead of a synchronous API call — prevents timeouts.
3. **Role-based Access**: Add manager vs. viewer roles — currently the system is open.
4. **Pagination**: All list APIs would need pagination — currently they return full collections.
5. **Notification System**: Email/Slack alerts when a conflict is detected, instead of requiring manual checks.

The MongoDB schema itself scales well — no structural changes needed, just performance optimizations.

---

### 8. If you had one additional week to work on this, what would you improve first?

**Priority 1 — Auto-suggest conflict resolutions**: Instead of just flagging conflicts, suggest the best available employee to cover (based on skills, current load, and shift). This is the #1 pain point for managers.

**Priority 2 — PDF/Excel export**: Allow downloading the monthly roster as a formatted Excel sheet or PDF — ops teams live in spreadsheets.

**Priority 3 — Audit log**: Track every roster change (who changed what, when) so there's a full history for accountability.

**Priority 4 — Mobile-responsive UI**: The current grid-based calendar doesn't scale well on mobile — a card-based layout for employee view would help field managers.

