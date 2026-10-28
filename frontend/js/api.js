/**
 * api.js - Centralized API client for Smart Roster Management System
 */

const API_BASE = '/api';

const MONTH_NAMES = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const STATUS_LABELS = {
    'working': 'W',
    'leave': 'L',
    'weekly-off': 'O',
    'holiday': 'H',
    'conflict': '!',
    'unassigned': '-'
};

// ─── Core Fetch ──────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
    try {
        const res = await fetch(API_BASE + path, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'API error');
        return data;
    } catch (err) {
        showToast(err.message, 'error');
        throw err;
    }
}

// ─── API wrappers ─────────────────────────────────────────────────────────────
const API = {
    // Employees
    getEmployees: (params = {}) => apiFetch('/employees?' + new URLSearchParams(params)),
    getEmployee: id => apiFetch(`/employees/${id}`),
    createEmployee: data => apiFetch('/employees', { method: 'POST', body: JSON.stringify(data) }),
    updateEmployee: (id, data) => apiFetch(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteEmployee: id => apiFetch(`/employees/${id}`, { method: 'DELETE' }),

    // Brands
    getBrands: (params = {}) => apiFetch('/brands?' + new URLSearchParams(params)),
    getBrand: id => apiFetch(`/brands/${id}`),
    createBrand: data => apiFetch('/brands', { method: 'POST', body: JSON.stringify(data) }),
    updateBrand: (id, data) => apiFetch(`/brands/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteBrand: id => apiFetch(`/brands/${id}`, { method: 'DELETE' }),

    // Pods
    getPods: () => apiFetch('/pods'),
    createPod: data => apiFetch('/pods', { method: 'POST', body: JSON.stringify(data) }),
    updatePod: (id, data) => apiFetch(`/pods/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    // Assignments
    getAssignments: (params = {}) => apiFetch('/assignments?' + new URLSearchParams(params)),
    createAssignment: data => apiFetch('/assignments', { method: 'POST', body: JSON.stringify(data) }),
    deleteAssignment: id => apiFetch(`/assignments/${id}`, { method: 'DELETE' }),

    // Leaves
    getLeaves: (params = {}) => apiFetch('/leaves?' + new URLSearchParams(params)),
    createLeave: data => apiFetch('/leaves', { method: 'POST', body: JSON.stringify(data) }),
    updateLeave: (id, data) => apiFetch(`/leaves/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteLeave: id => apiFetch(`/leaves/${id}`, { method: 'DELETE' }),

    // Holidays
    getHolidays: (params = {}) => apiFetch('/holidays?' + new URLSearchParams(params)),
    createHoliday: data => apiFetch('/holidays', { method: 'POST', body: JSON.stringify(data) }),
    deleteHoliday: id => apiFetch(`/holidays/${id}`, { method: 'DELETE' }),

    // Roster
    generateRoster: (year, month) => apiFetch('/roster/generate', { method: 'POST', body: JSON.stringify({ year, month }) }),
    validateRoster: (year, month) => apiFetch(`/roster/validate?year=${year}&month=${month}`),
    getCompanyView: (year, month) => apiFetch(`/roster/company-view?year=${year}&month=${month}`),
    getPodView: (podId, year, month) => apiFetch(`/roster/pod-view/${podId}?year=${year}&month=${month}`),
    getBrandView: (brandId, year, month) => apiFetch(`/roster/brand-view/${brandId}?year=${year}&month=${month}`),
    getProcessView: (year, month, process) => apiFetch(`/roster/process-view?year=${year}&month=${month}&process=${process}`),
    getEmployeeView: (empId, year, month) => apiFetch(`/roster/employee-view/${empId}?year=${year}&month=${month}`),
    updateRosterEntry: (id, data) => apiFetch(`/roster/entry/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    getRosterSummary: (year, month) => apiFetch(`/roster/summary?year=${year}&month=${month}`),
    getConflicts: (year, month) => apiFetch(`/roster/conflicts?year=${year}&month=${month}`)
};

// ─── Toast Notification ──────────────────────────────────────────────────────
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// ─── Sidebar active state ────────────────────────────────────────────────────
function setActiveSidebarLink() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.sidebar-nav a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === path);
    });
}

// ─── Month/Year picker helpers ───────────────────────────────────────────────
function getCurrentMonthYear() {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

function getDayName(date) {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
}

function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ─── Render sidebar HTML ─────────────────────────────────────────────────────
function renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    sidebar.innerHTML = `
    <div class="sidebar-brand">
      <div class="sidebar-brand-icon">📋</div>
      <div class="sidebar-brand-text">
        <h5>Smart Roster</h5>
        <span>Management System</span>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="sidebar-section-label">Main</div>
      <a href="index.html"><span class="icon">🏠</span> Dashboard</a>
      <a href="roster.html"><span class="icon">📅</span> Roster</a>
      <a href="conflicts.html"><span class="icon">⚠️</span> Conflicts</a>
      <div class="sidebar-section-label">Management</div>
      <a href="employees.html"><span class="icon">👥</span> Employees</a>
      <a href="brands.html"><span class="icon">🏷️</span> Brands</a>
      <a href="pods.html"><span class="icon">📦</span> Pods</a>
      <a href="assignments.html"><span class="icon">🔗</span> Assignments</a>
      <div class="sidebar-section-label">Planning</div>
      <a href="leaves.html"><span class="icon">🏖️</span> Leaves</a>
      <a href="holidays.html"><span class="icon">🎉</span> Holidays</a>
    </nav>
    <div class="sidebar-footer">Datastraw © 2026</div>
  `;
    setActiveSidebarLink();
}

// Init sidebar on load
document.addEventListener('DOMContentLoaded', renderSidebar);
