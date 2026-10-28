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
