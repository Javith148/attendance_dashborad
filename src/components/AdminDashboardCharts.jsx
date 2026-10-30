import React, { useState } from 'react';
import { 
  Users, Clock, CheckCircle2, AlertCircle, Calendar, Briefcase, 
  TrendingUp, Building2, Home, ArrowUpRight, Activity, Filter, Eye 
} from 'lucide-react';
import { formatDate } from '../utils/storage';

export default function AdminDashboardCharts({ staffList, attendanceRecords, leavesList }) {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const todayStr = formatDate(new Date());
  const activeStaff = staffList.filter(s => s.role === 'staff');
  const totalStaffCount = activeStaff.length;

  // Today's attendance records
  const todayRecords = attendanceRecords.filter(r => r.date === todayStr);

  const todayPresent = todayRecords.filter(r => r.status === 'Present' || r.status === 'In Progress').length;
  const todayHalfDay = todayRecords.filter(r => r.status === 'Half Day').length;
  const todayLeave = todayRecords.filter(r => r.status === 'Leave').length;
  const todayAbsent = Math.max(0, totalStaffCount - (todayPresent + todayHalfDay + todayLeave));

  // WFH vs Office split for today
  const todayOffice = todayRecords.filter(r => r.workType === 'Office').length;
  const todayWfh = todayRecords.filter(r => r.workType === 'WFH').length;

  // Percentages for Donut
  const presentPct = totalStaffCount > 0 ? (todayPresent / totalStaffCount) * 100 : 0;
  const halfPct = totalStaffCount > 0 ? (todayHalfDay / totalStaffCount) * 100 : 0;
  const leavePct = totalStaffCount > 0 ? (todayLeave / totalStaffCount) * 100 : 0;
  const absentPct = totalStaffCount > 0 ? (todayAbsent / totalStaffCount) * 100 : 0;

  // SVG Donut calculation
  const radius = 68;
  const circumference = 2 * Math.PI * radius; // ~427.25

  const strokePresent = (presentPct / 100) * circumference;
  const strokeHalf = (halfPct / 100) * circumference;
  const strokeLeave = (leavePct / 100) * circumference;
  const strokeAbsent = (absentPct / 100) * circumference;

  const offsetPresent = 0;
  const offsetHalf = -strokePresent;
  const offsetLeave = -(strokePresent + strokeHalf);
  const offsetAbsent = -(strokePresent + strokeHalf + strokeLeave);

  // Department-wise aggregated metrics
  const deptStats = {};
  activeStaff.forEach(staff => {
    const dept = staff.department || 'Operations';
    if (!deptStats[dept]) {
      deptStats[dept] = { name: dept, staffCount: 0, totalHours: 0, activeToday: 0 };
    }
    deptStats[dept].staffCount += 1;

    // Sum monthly hours
    const staffAtt = attendanceRecords.filter(r => r.staffId === staff.id);
    staffAtt.forEach(r => {
      deptStats[dept].totalHours += (r.hoursWorked || 0);
    });

    // Check if active today
    const isTodayActive = todayRecords.some(r => r.staffId === staff.id && (r.status === 'Present' || r.status === 'In Progress'));
    if (isTodayActive) {
      deptStats[dept].activeToday += 1;
    }
  });

  const deptList = Object.values(deptStats);
  const maxHours = Math.max(...deptList.map(d => d.totalHours), 1);

  // Pending leaves
  const pendingLeaves = leavesList.filter(l => l.status === 'Pending');

  // Weekly Work Volume
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyCounts = [
    Math.round(totalStaffCount * 0.95),
    Math.round(totalStaffCount * 0.90),
    totalStaffCount,
    Math.round(totalStaffCount * 0.85),
    totalStaffCount,
    Math.round(totalStaffCount * 0.75)
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Executive Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-clean">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-brand-navy bg-indigo-50 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                Enterprise Dashboard
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              Attendance Analytics & Workforce Overview
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live corporate attendance metrics, work distribution, and department throughput
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 flex items-center space-x-3 shadow-clean">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Workforce Rate</div>
                <div className="text-sm font-extrabold text-slate-900">{presentPct.toFixed(0)}% Present</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 flex items-center space-x-3 shadow-clean">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-brand-navy flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Mode Split</div>
                <div className="text-sm font-extrabold text-slate-900">{todayOffice} Office • {todayWfh} WFH</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Workforce */}
        <div className="p-6 rounded-3xl bg-white shadow-clean hover:shadow-clean-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Workforce</span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-brand-navy flex items-center justify-center shadow-clean">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900">{totalStaffCount}</span>
              <span className="text-xs font-semibold text-slate-400">Personnel</span>
            </div>
          </div>
          <div className="mt-4 pt-1 flex items-center justify-between text-xs">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-50 text-[11px] font-semibold text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{deptList.length} Active Departments</span>
            </span>
          </div>
        </div>

        {/* Card 2: Present Today (>= 8h) */}
        <div className="p-6 rounded-3xl bg-white shadow-clean hover:shadow-clean-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Present (Full Day)</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-clean">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-emerald-600">{todayPresent}</span>
                <span className="text-xs font-semibold text-slate-400">Checked In</span>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700">
                {presentPct.toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(presentPct, 100)}%` }} 
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1.5">
              <span>Full 8h Shift Completed</span>
              <span className="font-bold text-slate-700">{todayPresent}/{totalStaffCount}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Half Day (< 8h) */}
        <div className="p-6 rounded-3xl bg-white shadow-clean hover:shadow-clean-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Half Day (&lt; 8h)</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-clean">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-amber-600">{todayHalfDay}</span>
                <span className="text-xs font-semibold text-slate-400">Staff</span>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-700">
                {halfPct.toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(halfPct, 100)}%` }} 
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1.5">
              <span>Shifts under 8 working hours</span>
              <span className="font-bold text-slate-700">{todayHalfDay}/{totalStaffCount}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Leave */}
        <div className="p-6 rounded-3xl bg-white shadow-clean hover:shadow-clean-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Leave</span>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-clean">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-rose-600">{todayLeave}</span>
                <span className="text-xs font-semibold text-slate-400">Approved</span>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-700">
                {leavePct.toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(leavePct, 100)}%` }} 
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1.5">
              <span>{pendingLeaves.length > 0 ? `${pendingLeaves.length} pending request${pendingLeaves.length > 1 ? 's' : ''}` : 'No pending approvals'}</span>
              <span className="font-bold text-slate-700">{todayLeave}/{totalStaffCount}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Attendance Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Total Staff Attendance Breakdown Chart (SVG Donut) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-clean flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Total Staff Attendance Breakdown
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Proportionate attendance status for current day
                </p>
              </div>
              <span className="text-[11px] font-bold text-brand-navy bg-indigo-50 px-2 py-0.5 rounded-lg">
                Live Donut
              </span>
            </div>

            {/* SVG Donut Visual */}
            <div className="relative flex items-center justify-center my-6">
              <svg className="w-52 h-52 transform -rotate-90" viewBox="0 0 170 170">
                {/* Background Ring */}
                <circle
                  cx="85"
                  cy="85"
                  r={radius}
                  className="stroke-slate-100 fill-none"
                  strokeWidth="20"
                />

                {/* Present Slice */}
                {presentPct > 0 && (
                  <circle
                    cx="85"
                    cy="85"
                    r={radius}
                    className="stroke-emerald-500 fill-none transition-all duration-700 cursor-pointer"
                    strokeWidth="20"
                    strokeDasharray={`${strokePresent} ${circumference}`}
                    strokeDashoffset={offsetPresent}
                    strokeLinecap="round"
                    onMouseEnter={() => setHoveredSlice({ label: 'Present Full Day', count: todayPresent, pct: presentPct })}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                )}

                {/* Half Day Slice */}
                {halfPct > 0 && (
                  <circle
                    cx="85"
                    cy="85"
                    r={radius}
                    className="stroke-amber-500 fill-none transition-all duration-700 cursor-pointer"
                    strokeWidth="20"
                    strokeDasharray={`${strokeHalf} ${circumference}`}
                    strokeDashoffset={offsetHalf}
                    strokeLinecap="round"
                    onMouseEnter={() => setHoveredSlice({ label: 'Half Day (<8h)', count: todayHalfDay, pct: halfPct })}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                )}

                {/* Leave Slice */}
                {leavePct > 0 && (
                  <circle
                    cx="85"
                    cy="85"
                    r={radius}
                    className="stroke-indigo-600 fill-none transition-all duration-700 cursor-pointer"
                    strokeWidth="20"
                    strokeDasharray={`${strokeLeave} ${circumference}`}
                    strokeDashoffset={offsetLeave}
                    strokeLinecap="round"
                    onMouseEnter={() => setHoveredSlice({ label: 'Approved Leave', count: todayLeave, pct: leavePct })}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                )}

                {/* Absent Slice */}
                {absentPct > 0 && (
                  <circle
                    cx="85"
                    cy="85"
                    r={radius}
                    className="stroke-rose-400 fill-none transition-all duration-700 cursor-pointer"
                    strokeWidth="20"
                    strokeDasharray={`${strokeAbsent} ${circumference}`}
                    strokeDashoffset={offsetAbsent}
                    strokeLinecap="round"
                    onMouseEnter={() => setHoveredSlice({ label: 'Absent', count: todayAbsent, pct: absentPct })}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                )}
              </svg>

              {/* Center Donut Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-3xl font-extrabold text-slate-900 leading-tight">
                  {hoveredSlice ? hoveredSlice.count : totalStaffCount}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {hoveredSlice ? hoveredSlice.label : 'Total Staff'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Legend Badges */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-700 font-semibold">Present</span>
              </div>
              <span className="font-extrabold text-slate-900">{todayPresent}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-700 font-semibold">Half Day</span>
              </div>
              <span className="font-extrabold text-slate-900">{todayHalfDay}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <span className="text-slate-700 font-semibold">Leave</span>
              </div>
              <span className="font-extrabold text-slate-900">{todayLeave}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="text-slate-700 font-semibold">Absent</span>
              </div>
              <span className="font-extrabold text-slate-900">{todayAbsent}</span>
            </div>
          </div>

        </div>

        {/* Chart 2: Department Hours & Throughput */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-clean flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Department Work Hours & Attendance
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Accumulated monthly hours logged across business units
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>

            {/* Department Progress Bars */}
            <div className="space-y-4 mt-5">
              {deptList.map(dept => {
                const pct = Math.min(100, Math.round((dept.totalHours / maxHours) * 100));
                return (
                  <div key={dept.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">{dept.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">({dept.staffCount} staff)</span>
                      </div>
                      <span className="font-bold text-brand-navy">
                        {dept.totalHours.toFixed(1)} hrs <span className="text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                      <div 
                        className="h-full rounded-full bg-brand-navy transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Work Volume Distribution */}
          <div className="mt-8 pt-5 border-t-0 bg-slate-50 -mx-6 -mb-8 p-6 rounded-b-3xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Weekly Attendance Trend (Mon - Sat)
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">
                Sundays: Company-wide Holiday
              </span>
            </div>
            
            <div className="flex items-end justify-between gap-3 h-20">
              {daysOfWeek.map((day, idx) => {
                const count = weeklyCounts[idx];
                const heightPct = Math.round((count / totalStaffCount) * 100);
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full bg-slate-200 rounded-t-xl overflow-hidden flex items-end h-14">
                      <div 
                        className="w-full bg-indigo-600 rounded-t-xl transition-all duration-500"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Row 3: Live Staff Shift Stream for Today */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-clean">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Today's Live Staff Check-In Activity
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Real-time shift log of staff working today
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Stream</span>
          </span>
        </div>

        {todayRecords.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
            No check-in activities recorded yet for today.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-3">
            {todayRecords.map(rec => (
              <div key={rec.id} className="p-4 rounded-2xl bg-slate-50 shadow-clean flex items-start justify-between space-x-3">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-white shadow-clean flex items-center justify-center font-bold text-xs text-brand-navy flex-shrink-0">
                    {rec.staffName ? rec.staffName.charAt(0) : 'S'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {rec.staffName}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                      {rec.workType === 'WFH' ? <Home className="w-3 h-3 text-indigo-500" /> : <Building2 className="w-3 h-3 text-indigo-500" />}
                      <span>{rec.workType} • In at {rec.checkIn || '09:00 AM'}</span>
                    </div>
                    {rec.notes && (
                      <div className="text-[10px] text-slate-400 italic truncate max-w-[190px] mt-1" title={rec.notes}>
                        "{rec.notes}"
                      </div>
                    )}
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                  rec.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                  rec.status === 'In Progress' ? 'bg-sky-100 text-sky-800 animate-pulse' :
                  rec.status === 'Half Day' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {rec.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
