import React, { useState, useMemo } from 'react';

// ─── TYPES ───────────────────────────────────────────────────────────────────
type LeaveType = 'Annual' | 'Sick' | 'Casual';
type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Pending HR';
type Role = 'EMPLOYEE' | 'ADMIN';
type AdminView = 'dashboard' | 'employees' | 'leave' | 'analytics';

interface LeaveBalances { Sick: number; Casual: number; Annual: number; }

interface User {
  id: number; name: string; email: string;
  role: Role; department: string;
}

interface Employee {
  id: number; name: string; email: string;
  department: string; position: string;
  joinDate: string; status: 'Active' | 'Inactive';
  phone: string; avatar: string;
}

interface LeaveRequest {
  id: number; userId: number; employeeName: string;
  department: string; leaveType: LeaveType;
  startDate: string; endDate: string;
  reason: string; status: LeaveStatus; createdAt: string;
}

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
const mockCurrentUser: User = {
  id: 101, name: 'Alex Vance', email: 'alex.vance@pinelab.com',
  role: 'EMPLOYEE', department: 'Engineering'
};

const mockLeaveBalances: LeaveBalances = { Sick: 5, Casual: 7, Annual: 14 };

const initialEmployees: Employee[] = [
  { id: 101, name: 'Alex Vance', email: 'alex.vance@pinelab.com', department: 'Engineering', position: 'Senior Engineer', joinDate: '2022-03-15', status: 'Active', phone: '+265 999 123 456', avatar: 'AV' },
  { id: 102, name: 'Sarah Jenkins', email: 's.jenkins@pinelab.com', department: 'Engineering', position: 'QA Lead', joinDate: '2021-07-01', status: 'Active', phone: '+265 888 234 567', avatar: 'SJ' },
  { id: 103, name: 'Michael Torres', email: 'm.torres@pinelab.com', department: 'HR', position: 'HR Manager', joinDate: '2020-01-10', status: 'Active', phone: '+265 777 345 678', avatar: 'MT' },
  { id: 104, name: 'Priya Nair', email: 'p.nair@pinelab.com', department: 'Finance', position: 'Financial Analyst', joinDate: '2023-02-20', status: 'Active', phone: '+265 666 456 789', avatar: 'PN' },
  { id: 105, name: 'David Osei', email: 'd.osei@pinelab.com', department: 'Marketing', position: 'Marketing Director', joinDate: '2019-11-05', status: 'Active', phone: '+265 555 567 890', avatar: 'DO' },
  { id: 106, name: 'Linda Mwale', email: 'l.mwale@pinelab.com', department: 'Operations', position: 'Ops Coordinator', joinDate: '2023-08-01', status: 'Inactive', phone: '+265 444 678 901', avatar: 'LM' },
  { id: 107, name: 'James Phiri', email: 'j.phiri@pinelab.com', department: 'Engineering', position: 'Junior Developer', joinDate: '2024-01-15', status: 'Active', phone: '+265 333 789 012', avatar: 'JP' },
  { id: 108, name: 'Amara Banda', email: 'a.banda@pinelab.com', department: 'Finance', position: 'Accountant', joinDate: '2022-09-12', status: 'Active', phone: '+265 222 890 123', avatar: 'AB' },
];

const initialLeaveRequests: LeaveRequest[] = [
  { id: 1, userId: 101, employeeName: 'Alex Vance', department: 'Engineering', leaveType: 'Annual', startDate: '2026-07-10', endDate: '2026-07-15', reason: 'Family road trip vacation.', status: 'Pending', createdAt: '2026-06-05' },
  { id: 2, userId: 102, employeeName: 'Sarah Jenkins', department: 'Engineering', leaveType: 'Sick', startDate: '2026-06-20', endDate: '2026-06-25', reason: 'Medical procedure recovery.', status: 'Approved', createdAt: '2026-05-30' },
  { id: 3, userId: 103, employeeName: 'Michael Torres', department: 'HR', leaveType: 'Casual', startDate: '2026-06-10', endDate: '2026-06-11', reason: 'Personal errands.', status: 'Approved', createdAt: '2026-06-01' },
  { id: 4, userId: 104, employeeName: 'Priya Nair', department: 'Finance', leaveType: 'Annual', startDate: '2026-08-01', endDate: '2026-08-10', reason: 'International travel.', status: 'Pending', createdAt: '2026-06-03' },
  { id: 5, userId: 105, employeeName: 'David Osei', department: 'Marketing', leaveType: 'Sick', startDate: '2026-05-15', endDate: '2026-05-17', reason: 'Flu and fever.', status: 'Rejected', createdAt: '2026-05-14' },
  { id: 6, userId: 107, employeeName: 'James Phiri', department: 'Engineering', leaveType: 'Casual', startDate: '2026-06-28', endDate: '2026-06-28', reason: 'Family event.', status: 'Pending HR', createdAt: '2026-06-06' },
  { id: 7, userId: 108, employeeName: 'Amara Banda', department: 'Finance', leaveType: 'Annual', startDate: '2026-07-21', endDate: '2026-07-25', reason: 'Rest and relaxation.', status: 'Approved', createdAt: '2026-06-02' },
];

// ─── ANALYTICS DATA ───────────────────────────────────────────────────────────
const analyticsData = {
  leaveByMonth: [
    { month: 'Jan', count: 4 }, { month: 'Feb', count: 6 }, { month: 'Mar', count: 3 },
    { month: 'Apr', count: 8 }, { month: 'May', count: 5 }, { month: 'Jun', count: 7 },
  ],
  leaveByDept: [
    { dept: 'Engineering', count: 12 }, { dept: 'Finance', count: 8 },
    { dept: 'HR', count: 5 }, { dept: 'Marketing', count: 6 }, { dept: 'Operations', count: 3 },
  ],
  leaveByType: [
    { type: 'Annual', count: 18, color: '#10b981' },
    { type: 'Sick', count: 11, color: '#f59e0b' },
    { type: 'Casual', count: 9, color: '#6366f1' },
  ],
  statusBreakdown: [
    { status: 'Approved', count: 22, color: '#10b981' },
    { status: 'Pending', count: 9, color: '#f59e0b' },
    { status: 'Rejected', count: 7, color: '#ef4444' },
  ],
};

// ─── EXCEL EXPORT ─────────────────────────────────────────────────────────────
function exportToExcel(requests: LeaveRequest[]) {
  const approved = requests.filter(r => r.status === 'Approved');

  // Build CSV content that Excel understands with BOM for proper encoding
  const headers = ['ID', 'Employee Name', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Reason', 'Status', 'Submitted On'];
  const rows = approved.map(r => [
    r.id, r.employeeName, r.department, r.leaveType,
    r.startDate, r.endDate, `"${r.reason}"`, r.status, r.createdAt
  ]);

  const csvContent = '\uFEFF' + [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pinelab_payroll_export_${new Date().toISOString().split('T')[0]}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── MINI BAR CHART ───────────────────────────────────────────────────────────
function BarChart({ data, color = '#10b981' }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-1">
          <span className="text-[10px] font-bold text-slate-500">{d.value}</span>
          <div
            className="w-full rounded-t-md transition-all duration-500"
            style={{ height: `${(d.value / max) * 80}px`, backgroundColor: color }}
          />
          <span className="text-[10px] text-slate-400 font-medium truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── DONUT CHART ─────────────────────────────────────────────────────────────
function DonutChart({ data }: { data: { type: string; count: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  let cumulative = 0;
  const segments = data.map(d => {
    const pct = (d.count / total) * 100;
    const segment = { ...d, pct, offset: cumulative };
    cumulative += pct;
    return segment;
  });
  const circumference = 2 * Math.PI * 40;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
        {segments.map((seg, i) => (
          <circle
            key={i} cx="50" cy="50" r="40" fill="none"
            stroke={seg.color} strokeWidth="18"
            strokeDasharray={`${(seg.pct / 100) * circumference} ${circumference}`}
            strokeDashoffset={`${-(seg.offset / 100) * circumference}`}
          />
        ))}
        <circle cx="50" cy="50" r="31" fill="white" />
      </svg>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-slate-600 font-medium">{d.type}</span>
            <span className="text-xs font-bold text-slate-900 ml-auto pl-4">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition text-xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent = '#10b981' }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: accent }} />
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-500 font-medium mt-1">{sub}</p>}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<User>(mockCurrentUser);
  const [requests, setRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [balances, setBalances] = useState<LeaveBalances>(mockLeaveBalances);

  // Navigation
  const [currentView, setCurrentView] = useState<'dashboard' | 'apply' | 'audit'>('dashboard');
  const [adminSection, setAdminSection] = useState<AdminView>('dashboard');

  // Leave form
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  // Employee modal
  const [empModal, setEmpModal] = useState<'add' | 'edit' | null>(null);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [empForm, setEmpForm] = useState<Partial<Employee>>({});

  // Leave filter
  const [leaveFilter, setLeaveFilter] = useState<LeaveStatus | 'All'>('All');

  // ── Conflict check ──
  const hasConflict = useMemo(() => {
    if (!startDate || !endDate) return false;
    return requests.some(r =>
      r.department === user.department && r.status === 'Approved' &&
      ((startDate >= r.startDate && startDate <= r.endDate) ||
        (endDate >= r.startDate && endDate <= r.endDate))
    );
  }, [startDate, endDate, requests, user.department]);

  // ── Role toggle ──
  const toggleRole = () => {
    const newRole: Role = user.role === 'EMPLOYEE' ? 'ADMIN' : 'EMPLOYEE';
    setUser({ ...user, role: newRole });
    setCurrentView('dashboard');
    setAdminSection('dashboard');
  };

  // ── Leave apply ──
  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) return alert('Please fill out all fields.');
    const newRequest: LeaveRequest = {
      id: requests.length + 1, userId: user.id, employeeName: user.name,
      department: user.department, leaveType, startDate, endDate, reason,
      status: leaveType === 'Sick' ? 'Pending HR' : 'Pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setRequests([newRequest, ...requests]);
    setCurrentView('dashboard');
    setStartDate(''); setEndDate(''); setReason(''); setFileName(null);
  };

  // ── Leave status update ──
  const handleUpdateStatus = (id: number, status: 'Approved' | 'Rejected') => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        if (status === 'Approved' && req.userId === user.id) {
          const type = req.leaveType as keyof LeaveBalances;
          setBalances(b => ({ ...b, [type]: Math.max(0, b[type] - 2) }));
        }
        return { ...req, status };
      }
      return req;
    }));
  };

  // ── Employee CRUD ──
  const openAddEmp = () => {
    setEmpForm({ status: 'Active' });
    setSelectedEmp(null);
    setEmpModal('add');
  };

  const openEditEmp = (emp: Employee) => {
    setEmpForm({ ...emp });
    setSelectedEmp(emp);
    setEmpModal('edit');
  };

  const handleSaveEmp = () => {
    if (!empForm.name || !empForm.email || !empForm.department) return alert('Fill required fields.');
    if (empModal === 'add') {
      const newEmp: Employee = {
        id: Math.max(...employees.map(e => e.id)) + 1,
        name: empForm.name!, email: empForm.email!, department: empForm.department!,
        position: empForm.position || 'Staff', joinDate: empForm.joinDate || new Date().toISOString().split('T')[0],
        status: empForm.status as 'Active' | 'Inactive' || 'Active',
        phone: empForm.phone || '-',
        avatar: empForm.name!.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      };
      setEmployees(prev => [newEmp, ...prev]);
    } else if (empModal === 'edit' && selectedEmp) {
      setEmployees(prev => prev.map(e => e.id === selectedEmp.id ? { ...e, ...empForm } as Employee : e));
    }
    setEmpModal(null);
  };

  const handleDeleteEmp = (id: number) => {
    if (confirm('Delete this employee record?')) {
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  };

  // ── Filtered leave requests ──
  const filteredLeave = useMemo(() =>
    leaveFilter === 'All' ? requests : requests.filter(r => r.status === leaveFilter),
    [requests, leaveFilter]
  );

  const depts = [...new Set(employees.map(e => e.department))];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* ── NAVBAR ── */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 text-slate-900 p-2 rounded text-xl font-black tracking-tighter">PL</div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">Pine Lab</h1>
              <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Enterprise Leave Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={toggleRole} className="bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold py-2 px-4 rounded transition border border-slate-700 shadow-sm">
              Demo Mode: <span className="text-white uppercase">{user.role}</span>
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-slate-400">{user.department}</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── LAYOUT ── */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* ── SIDEBAR ── */}
        <aside className="lg:col-span-1">
          <nav className="space-y-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Navigation</p>

            {/* System Dashboard — shown to both roles */}
            {user.role === 'ADMIN' ? (
              <button
                onClick={() => setAdminSection('dashboard')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center space-x-3 ${adminSection === 'dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                <span>System Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center space-x-3 ${currentView === 'dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                <span>System Dashboard</span>
              </button>
            )}

            {/* EMPLOYEE nav */}
            {user.role === 'EMPLOYEE' && (
              <button
                onClick={() => setCurrentView('apply')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center space-x-3 ${currentView === 'apply' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <span>File Leave Request</span>
              </button>
            )}

            {/* ADMIN sub-links */}
            {user.role === 'ADMIN' && (
              <>
                <div className="pt-3 mt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-2 mb-2">Admin</p>
                </div>

                {([
                  { id: 'employees', label: 'Employees', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /> },
                  { id: 'leave', label: 'Leave Management', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
                  { id: 'analytics', label: 'Analytics', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
                ] as const).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setAdminSection(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center space-x-3 ${adminSection === item.id ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                    <span>{item.label}</span>
                  </button>
                ))}

                <div className="pt-3 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => exportToExcel(requests)}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center space-x-3 group"
                  >
                    <svg className="w-5 h-5 text-emerald-500 group-hover:text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                    <span>Export to Excel</span>
                  </button>
                </div>
              </>
            )}
          </nav>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="lg:col-span-3 space-y-8">

          {/* ═══════════════════════════════════════════════
              EMPLOYEE VIEW: Dashboard
          ═══════════════════════════════════════════════ */}
          {user.role === 'EMPLOYEE' && currentView === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(balances).map(([type, count]) => (
                  <StatCard key={type} label={`${type} Leave`} value={count} sub="Days Accrued" accent={type === 'Annual' ? '#10b981' : type === 'Sick' ? '#f59e0b' : '#6366f1'} />
                ))}
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50">
                  <h2 className="font-bold text-slate-900 text-base">Your Action History</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white text-slate-400 uppercase text-xs font-extrabold tracking-wider border-b border-slate-200">
                        <th className="p-4">Type</th><th className="p-4">Duration</th>
                        <th className="p-4 hidden md:table-cell">Reason</th><th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {requests.filter(r => r.userId === user.id).map(req => (
                        <tr key={req.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4 font-semibold text-slate-700">{req.leaveType}</td>
                          <td className="p-4"><div className="font-medium text-slate-900">{req.startDate}</div><div className="text-xs text-slate-400">to {req.endDate}</div></td>
                          <td className="p-4 text-slate-500 max-w-xs truncate hidden md:table-cell">{req.reason}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded border shadow-sm ${req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : req.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : req.status === 'Pending HR' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{req.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════
              EMPLOYEE VIEW: Apply
          ═══════════════════════════════════════════════ */}
          {user.role === 'EMPLOYEE' && currentView === 'apply' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm max-w-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50">
                <h2 className="font-bold text-slate-900 text-base">File New Leave Request</h2>
                <p className="text-xs text-slate-500 mt-1">Attachments required for Sick or Bereavement routing.</p>
              </div>
              <form onSubmit={handleApplyLeave} className="p-6 space-y-6">
                {hasConflict && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start space-x-3">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <div>
                      <h4 className="text-sm font-bold text-amber-800">Department Coverage Notice</h4>
                      <p className="text-xs text-amber-700 mt-1">Another member of the {user.department} team has approved leave during these dates.</p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Leave Specification</label>
                  <select value={leaveType} onChange={e => setLeaveType(e.target.value as LeaveType)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition">
                    <option value="Annual">Standard Annual Leave</option>
                    <option value="Sick">Medical / Sick Leave</option>
                    <option value="Casual">Casual Personal Time</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Date</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Justification</label>
                  <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Provide context for manager review..." className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Supporting Documents</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition cursor-pointer" onClick={() => setFileName('medical_cert_v2.pdf')}>
                    <svg className="mx-auto h-8 w-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    <span className="text-sm font-medium text-emerald-600">Upload a file</span> <span className="text-sm text-slate-500">or drag and drop</span>
                    <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG up to 10MB</p>
                    {fileName && <p className="text-xs font-bold text-indigo-600 mt-2 bg-indigo-50 inline-block px-2 py-1 rounded">Attached: {fileName}</p>}
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setCurrentView('dashboard')} className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold shadow-md transition">Submit Request</button>
                </div>
              </form>
            </div>
          )}

          {/* ═══════════════════════════════════════════════
              ADMIN: System Dashboard
          ═══════════════════════════════════════════════ */}
          {user.role === 'ADMIN' && adminSection === 'dashboard' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Total Employees" value={employees.length} sub="Across all departments" accent="#6366f1" />
                <StatCard label="Active Staff" value={employees.filter(e => e.status === 'Active').length} sub="Currently employed" accent="#10b981" />
                <StatCard label="Pending Requests" value={requests.filter(r => r.status.includes('Pending')).length} sub="Awaiting review" accent="#f59e0b" />
                <StatCard label="Approved This Month" value={requests.filter(r => r.status === 'Approved').length} sub="Leave approvals" accent="#10b981" />
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h2 className="font-bold text-slate-900 text-base">Global Departmental Requests</h2>
                  <span className="text-xs text-slate-400 font-medium">{requests.length} total records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white text-slate-400 uppercase text-xs font-extrabold tracking-wider border-b border-slate-200">
                        <th className="p-4">Employee</th><th className="p-4">Type</th>
                        <th className="p-4">Duration</th><th className="p-4 hidden md:table-cell">Details</th>
                        <th className="p-4">Status</th><th className="p-4 text-center">Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {requests.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4"><div className="font-bold text-slate-900">{req.employeeName}</div><div className="text-xs text-slate-500">{req.department}</div></td>
                          <td className="p-4 font-semibold text-slate-700">{req.leaveType}</td>
                          <td className="p-4"><div className="font-medium">{req.startDate}</div><div className="text-xs text-slate-400">to {req.endDate}</div></td>
                          <td className="p-4 text-slate-500 max-w-xs truncate hidden md:table-cell">{req.reason}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded border shadow-sm ${req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : req.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : req.status === 'Pending HR' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{req.status}</span>
                          </td>
                          <td className="p-4">
                            {req.status.includes('Pending') ? (
                              <div className="flex items-center justify-center space-x-2">
                                <button onClick={() => handleUpdateStatus(req.id, 'Approved')} className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3 py-1.5 rounded font-bold transition">Approve</button>
                                <button onClick={() => handleUpdateStatus(req.id, 'Rejected')} className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs px-3 py-1.5 rounded font-bold transition">Deny</button>
                              </div>
                            ) : (
                              <div className="text-center text-xs text-slate-400 font-medium">Processed</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════
              ADMIN: Employees CRUD
          ═══════════════════════════════════════════════ */}
          {user.role === 'ADMIN' && adminSection === 'employees' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Employee Directory</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{employees.length} employees across {depts.length} departments</p>
                </div>
                <button onClick={openAddEmp} className="bg-slate-900 hover:bg-slate-800 text-white text-sm px-4 py-2.5 rounded-lg font-bold transition shadow-md flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Add Employee
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 uppercase text-xs font-extrabold tracking-wider border-b border-slate-200">
                        <th className="p-4">Employee</th>
                        <th className="p-4 hidden lg:table-cell">Position</th>
                        <th className="p-4 hidden md:table-cell">Department</th>
                        <th className="p-4 hidden xl:table-cell">Phone</th>
                        <th className="p-4 hidden lg:table-cell">Joined</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {employees.map(emp => (
                        <tr key={emp.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black flex-shrink-0">{emp.avatar}</div>
                              <div>
                                <div className="font-bold text-slate-900">{emp.name}</div>
                                <div className="text-xs text-slate-400">{emp.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 hidden lg:table-cell">{emp.position}</td>
                          <td className="p-4 hidden md:table-cell">
                            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">{emp.department}</span>
                          </td>
                          <td className="p-4 text-slate-500 text-xs hidden xl:table-cell">{emp.phone}</td>
                          <td className="p-4 text-slate-500 text-xs hidden lg:table-cell">{emp.joinDate}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{emp.status}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => openEditEmp(emp)} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition px-2 py-1 rounded hover:bg-indigo-50">Edit</button>
                              <button onClick={() => handleDeleteEmp(emp.id)} className="text-xs text-rose-500 hover:text-rose-700 font-bold transition px-2 py-1 rounded hover:bg-rose-50">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════
              ADMIN: Leave Management
          ═══════════════════════════════════════════════ */}
          {user.role === 'ADMIN' && adminSection === 'leave' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Leave Management</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Review and action all employee leave requests</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {(['All', 'Pending', 'Pending HR', 'Approved', 'Rejected'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setLeaveFilter(s)}
                      className={`text-xs px-3 py-1.5 rounded-full font-bold border transition ${leaveFilter === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                      {s} {s !== 'All' && <span className="ml-1 opacity-70">{requests.filter(r => r.status === s).length}</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Total" value={requests.length} accent="#6366f1" />
                <StatCard label="Pending" value={requests.filter(r => r.status.includes('Pending')).length} accent="#f59e0b" />
                <StatCard label="Approved" value={requests.filter(r => r.status === 'Approved').length} accent="#10b981" />
                <StatCard label="Rejected" value={requests.filter(r => r.status === 'Rejected').length} accent="#ef4444" />
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 uppercase text-xs font-extrabold tracking-wider border-b border-slate-200">
                        <th className="p-4">Employee</th><th className="p-4">Type</th>
                        <th className="p-4">Duration</th><th className="p-4 hidden md:table-cell">Reason</th>
                        <th className="p-4">Status</th><th className="p-4">Submitted</th>
                        <th className="p-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredLeave.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4"><div className="font-bold text-slate-900">{req.employeeName}</div><div className="text-xs text-slate-500">{req.department}</div></td>
                          <td className="p-4 font-semibold text-slate-700">{req.leaveType}</td>
                          <td className="p-4"><div className="font-medium">{req.startDate}</div><div className="text-xs text-slate-400">to {req.endDate}</div></td>
                          <td className="p-4 text-slate-500 max-w-[180px] truncate hidden md:table-cell">{req.reason}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded border ${req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : req.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : req.status === 'Pending HR' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{req.status}</span>
                          </td>
                          <td className="p-4 text-xs text-slate-400">{req.createdAt}</td>
                          <td className="p-4">
                            {req.status.includes('Pending') ? (
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => handleUpdateStatus(req.id, 'Approved')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1 rounded font-bold transition">✓</button>
                                <button onClick={() => handleUpdateStatus(req.id, 'Rejected')} className="bg-rose-500 hover:bg-rose-600 text-white text-xs px-2.5 py-1 rounded font-bold transition">✕</button>
                              </div>
                            ) : (
                              <div className="text-center text-xs text-slate-300 font-medium">—</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredLeave.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-sm font-medium">No records match this filter.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════
              ADMIN: Analytics
          ═══════════════════════════════════════════════ */}
          {user.role === 'ADMIN' && adminSection === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Leave Analytics</h2>
                <p className="text-sm text-slate-500 mt-0.5">Organisation-wide leave insights — dummy data, replaced with live data tomorrow</p>
              </div>

              {/* KPI row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Total Leave Days" value={38} sub="YTD across org" accent="#6366f1" />
                <StatCard label="Avg per Employee" value="4.75" sub="Days taken" accent="#10b981" />
                <StatCard label="Peak Month" value="Apr" sub="8 requests" accent="#f59e0b" />
                <StatCard label="Approval Rate" value="73%" sub="Of all requests" accent="#10b981" />
              </div>

              {/* Charts row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-700 mb-1">Leave Requests by Month</h3>
                  <p className="text-xs text-slate-400 mb-4">Jan – Jun 2026</p>
                  <BarChart
                    data={analyticsData.leaveByMonth.map(d => ({ label: d.month, value: d.count }))}
                    color="#10b981"
                  />
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-700 mb-1">Leave by Department</h3>
                  <p className="text-xs text-slate-400 mb-4">Total approved days per team</p>
                  <BarChart
                    data={analyticsData.leaveByDept.map(d => ({ label: d.dept, value: d.count }))}
                    color="#6366f1"
                  />
                </div>
              </div>

              {/* Charts row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-700 mb-1">Leave Type Distribution</h3>
                  <p className="text-xs text-slate-400 mb-5">Breakdown across all request types</p>
                  <DonutChart data={analyticsData.leaveByType} />
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-700 mb-1">Request Status Breakdown</h3>
                  <p className="text-xs text-slate-400 mb-5">Outcome distribution this period</p>
                  <DonutChart data={analyticsData.statusBreakdown} />
                </div>
              </div>

              {/* Dept utilisation table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-slate-900 text-sm">Department Leave Utilisation</h3>
                </div>
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="text-slate-400 uppercase text-xs font-extrabold tracking-wider border-b border-slate-200">
                      <th className="p-4">Department</th>
                      <th className="p-4">Headcount</th>
                      <th className="p-4">Requests</th>
                      <th className="p-4">Approved</th>
                      <th className="p-4">Utilisation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analyticsData.leaveByDept.map(d => {
                      const headcount = employees.filter(e => e.department === d.dept).length;
                      const approved = requests.filter(r => r.department === d.dept && r.status === 'Approved').length;
                      const total = requests.filter(r => r.department === d.dept).length;
                      const pct = total > 0 ? Math.round((approved / total) * 100) : 0;
                      return (
                        <tr key={d.dept} className="hover:bg-slate-50/50 transition">
                          <td className="p-4 font-semibold text-slate-900">{d.dept}</td>
                          <td className="p-4 text-slate-600">{headcount || '—'}</td>
                          <td className="p-4 text-slate-600">{total}</td>
                          <td className="p-4 text-emerald-600 font-bold">{approved}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-100 rounded-full h-2 max-w-[80px]">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs font-bold text-slate-500">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ═══════════════════════════════════════════════
          EMPLOYEE MODAL (Add / Edit)
      ═══════════════════════════════════════════════ */}
      {empModal && (
        <Modal title={empModal === 'add' ? 'Add New Employee' : 'Edit Employee'} onClose={() => setEmpModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input value={empForm.name || ''} onChange={e => setEmpForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email *</label>
                <input value={empForm.email || ''} onChange={e => setEmpForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="jane@pinelab.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Department *</label>
                <select value={empForm.department || ''} onChange={e => setEmpForm(f => ({ ...f, department: e.target.value }))} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="">Select dept...</option>
                  {['Engineering', 'HR', 'Finance', 'Marketing', 'Operations'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Position</label>
                <input value={empForm.position || ''} onChange={e => setEmpForm(f => ({ ...f, position: e.target.value }))} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Senior Engineer" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
                <input value={empForm.phone || ''} onChange={e => setEmpForm(f => ({ ...f, phone: e.target.value }))} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="+265 999 000 000" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Join Date</label>
                <input type="date" value={empForm.joinDate || ''} onChange={e => setEmpForm(f => ({ ...f, joinDate: e.target.value }))} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
              <select value={empForm.status || 'Active'} onChange={e => setEmpForm(f => ({ ...f, status: e.target.value as 'Active' | 'Inactive' }))} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setEmpModal(null)} className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleSaveEmp} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold shadow-md transition">
                {empModal === 'add' ? 'Add Employee' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
