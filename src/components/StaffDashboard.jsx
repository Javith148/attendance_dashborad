import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, User, Briefcase, Building2, Home, CheckCircle2, 
  AlertCircle, DollarSign, Download, Plus, MapPin, Shield, ShieldCheck,
  RefreshCw, Mail, Phone, CalendarDays, Timer, LogOut, Sparkles
} from 'lucide-react';
import CheckInModal from './CheckInModal';
import LeaveRequestModal from './LeaveRequestModal';
import AttendanceCalendar from './AttendanceCalendar';
import StaffSalaryCard from './StaffSalaryCard';
import { 
  getTodayAttendanceForStaff, 
  recordCheckIn, 
  recordCheckOut, 
  getAttendance, 
  getLeaves, 
  submitLeave, 
  formatDate 
} from '../utils/storage';

export default function StaffDashboard({ currentUser }) {
  const [attendanceList, setAttendanceList] = useState([]);
  const [leavesList, setLeavesList] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState(0);
  const [wallClock, setWallClock] = useState({ hrs: '00', mins: '00', secs: '00', ampm: 'AM' });
  const [notification, setNotification] = useState(null);

  // Load staff data
  const loadData = () => {
    const allAtt = getAttendance();
    setAttendanceList(allAtt);
    const today = getTodayAttendanceForStaff(currentUser.id);
    setTodayRecord(today);

    const allLeaves = getLeaves();
    const myLeaves = allLeaves.filter(l => l.staffId === currentUser.id);
    setLeavesList(myLeaves);
  };

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  // Robust start time parser for ISO string or "09:05 AM"
  const getShiftStartTimeMs = (rec) => {
    if (!rec) return null;
    if (rec.checkInIso) {
      const parsed = new Date(rec.checkInIso).getTime();
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    if (rec.checkIn) {
      try {
        const parts = rec.checkIn.trim().split(' ');
        const timePart = parts[0];
        const modifier = parts[1] ? parts[1].toUpperCase() : '';
        let [hours, minutes] = timePart.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        const d = new Date();
        d.setHours(hours || 9, minutes || 0, 0, 0);
        return d.getTime();
      } catch (e) {
        // fallback
      }
    }
    return Date.now() - 3600 * 1000;
  };

  // Active check-in timer & wall clock ticking every second
  useEffect(() => {
    const updateClocks = () => {
      // Update wall clock
      const nowObj = new Date();
      let hrs = nowObj.getHours();
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      hrs = hrs % 12 || 12;
      setWallClock({
        hrs: String(hrs).padStart(2, '0'),
        mins: String(nowObj.getMinutes()).padStart(2, '0'),
        secs: String(nowObj.getSeconds()).padStart(2, '0'),
        ampm
      });

      // Update shift duration timer
      if (todayRecord && todayRecord.status === 'In Progress') {
        const startMs = getShiftStartTimeMs(todayRecord);
        if (startMs) {
          const diffSecs = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
          setActiveTimerSeconds(diffSecs);
        }
      } else {
        setActiveTimerSeconds(0);
      }
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, [todayRecord]);

  // Format seconds to { hrs, mins, secs }
  const formatTimerParts = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return {
      hrs: String(hrs).padStart(2, '0'),
      mins: String(mins).padStart(2, '0'),
      secs: String(secs).padStart(2, '0')
    };
  };

  // Handle Check-In Confirmation
  const handleConfirmCheckIn = ({ workType, checkInTime, notes }) => {
    const rec = recordCheckIn({
      staffId: currentUser.id,
      staffName: currentUser.name,
      workType,
      notes,
      checkInTime
    });
    setTodayRecord(rec);
    loadData();
    showNotification('success', `Checked in successfully for today (${workType}). Live shift timer is active.`);
  };

  // Handle Check-Out
  const handleCheckOut = () => {
    try {
      const updated = recordCheckOut({ staffId: currentUser.id });
      setTodayRecord(updated);
      loadData();

      if (updated.status === 'Half Day') {
        showNotification('warning', `Checked out. Total hours: ${updated.hoursWorked}h (less than 8h). Marked as Half Day.`);
      } else {
        showNotification('success', `Shift completed! Total hours: ${updated.hoursWorked}h. Full Day Present credited.`);
      }
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // Handle Leave Application
  const handleSubmitLeave = (leaveData) => {
    submitLeave(leaveData);
    loadData();
    showNotification('success', 'Leave application submitted. Sent to Admin panel for approval.');
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Calculate quick metrics for this staff
  const thisMonthRecords = attendanceList.filter(r => {
    if (r.staffId !== currentUser.id) return false;
    const d = new Date(r.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const fullDaysCount = thisMonthRecords.filter(r => r.status === 'Present').length;
  const halfDaysCount = thisMonthRecords.filter(r => r.status === 'Half Day').length;
  const totalHoursWorked = thisMonthRecords.reduce((acc, curr) => acc + (curr.hoursWorked || 0), 0);

  const timerParts = formatTimerParts(activeTimerSeconds);
  const target8HoursSecs = 8 * 3600;
  const shiftProgressPct = Math.min(100, Math.round((activeTimerSeconds / target8HoursSecs) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl shadow-clean-md flex items-center space-x-3 text-xs font-semibold animate-in slide-in-from-top-4 duration-300 ${
          notification.type === 'success' ? 'bg-emerald-600 text-white' :
          notification.type === 'warning' ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Split Grid: Left Side (Staff Details) + Right Side (Shift Tracker & Timer ABOVE Attendance Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT COLUMN: STAFF DETAILS (4 or 5 COLS) ================= */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Staff Profile Details Card */}
          <div className="bg-white rounded-3xl p-6 shadow-clean relative overflow-hidden">
            <div className="flex items-start space-x-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-clean flex-shrink-0 ${currentUser.avatarBg || 'bg-brand-navy'}`}>
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 flex-wrap gap-1">
                  <h2 className="text-xl font-bold text-slate-900 truncate">
                    {currentUser.name}
                  </h2>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg">
                    {currentUser.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  {currentUser.designation}
                </p>
                <div className="inline-flex items-center space-x-1.5 mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-700">
                  <Building2 className="w-3 h-3 text-indigo-600" />
                  <span>Dept: {currentUser.department}</span>
                </div>
              </div>
            </div>

            {/* Quick Metadata Information Chips */}
            <div className="mt-5 pt-4 bg-slate-50 -mx-6 -mb-6 p-5 rounded-b-3xl space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center space-x-2 text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </span>
                <span className="font-semibold text-slate-800 truncate max-w-[200px]">{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center space-x-2 text-slate-400">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Phone</span>
                </span>
                <span className="font-semibold text-slate-800">{currentUser.phone || '+91 98401 23456'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center space-x-2 text-slate-400">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>Joined Date</span>
                </span>
                <span className="font-semibold text-slate-800">{currentUser.joinDate || '2023-06-15'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 pt-2">
                <span className="flex items-center space-x-2 text-slate-400">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Daily Rate</span>
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Rs. {currentUser.dailySalary} / day
                </span>
              </div>
            </div>
          </div>

          {/* 2. Monthly Attendance Quick Stats */}
          <div className="bg-white rounded-3xl p-5 shadow-clean">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Monthly Attendance Summary
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-emerald-50/80 p-3 rounded-2xl">
                <div className="text-xl font-black text-emerald-700">{fullDaysCount}</div>
                <div className="text-[10px] font-bold text-emerald-800 uppercase mt-0.5">Full Days</div>
              </div>
              <div className="bg-amber-50/80 p-3 rounded-2xl">
                <div className="text-xl font-black text-amber-700">{halfDaysCount}</div>
                <div className="text-[10px] font-bold text-amber-800 uppercase mt-0.5">Half Days</div>
              </div>
              <div className="bg-indigo-50/80 p-3 rounded-2xl">
                <div className="text-xl font-black text-indigo-700">{totalHoursWorked.toFixed(1)}</div>
                <div className="text-[10px] font-bold text-indigo-800 uppercase mt-0.5">Hours Logged</div>
              </div>
            </div>
          </div>

          {/* 3. Attendance Policy Guide Card */}
          <div className="bg-white rounded-3xl p-5 shadow-clean space-y-3 text-xs text-slate-600">
            <div className="flex items-center space-x-2 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-brand-navy" />
              <span>MAAS Official Attendance Rules</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-500 pl-1">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span><strong>Full Day Present:</strong> Requires 8.0 or more completed working hours.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <span><strong>Half Day:</strong> Shifts under 8.0 hours are automatically computed as Half-Day.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                <span><strong>Sundays:</strong> Official weekly paid holiday for all employees.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: SHIFT TRACKER & TIMER ABOVE ATTENDANCE CALENDAR (7 COLS) ================= */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Live Shift & Ticking Timer Card (ABOVE ATTENDANCE CALENDAR) */}
          <div className="bg-white rounded-3xl p-6 shadow-clean space-y-5">
            
            {/* Header Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Shift Tracker & Timer
                </h3>
                <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                  {todayRecord && todayRecord.status === 'In Progress' && 'Active Shift Ongoing'}
                  {(!todayRecord || todayRecord.status === 'Absent') && 'Ready to Start Shift'}
                  {todayRecord && todayRecord.status !== 'In Progress' && todayRecord.status !== 'Absent' && 'Shift Completed for Today'}
                </div>
              </div>

              {/* Status Badge */}
              {todayRecord && todayRecord.status === 'In Progress' ? (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold shadow-clean self-start sm:self-auto">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>LIVE ACTIVE</span>
                </div>
              ) : todayRecord && todayRecord.status !== 'In Progress' ? (
                <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{todayRecord.status}</span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold self-start sm:self-auto">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Not Checked In</span>
                </div>
              )}
            </div>

            {/* LIVE DIGITAL TICKING CLOCK DISPLAY */}
            <div className="bg-slate-900 rounded-2xl p-5 shadow-clean text-center text-white space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-center space-x-1.5">
                <Timer className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {todayRecord && todayRecord.status === 'In Progress' ? 'Shift Duration (Ticking Live)' : 'Current Standard Time'}
                </span>
              </div>

              {todayRecord && todayRecord.status === 'In Progress' ? (
                /* Shift Elapsed Stopwatch */
                <div className="flex items-center justify-center space-x-2 font-mono">
                  <div className="bg-slate-800/90 rounded-2xl px-3 sm:px-4 py-2.5 text-center min-w-[64px] shadow-inner">
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                      {timerParts.hrs}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Hours</div>
                  </div>
                  <span className="text-2xl font-black text-emerald-400 animate-pulse">:</span>
                  <div className="bg-slate-800/90 rounded-2xl px-3 sm:px-4 py-2.5 text-center min-w-[64px] shadow-inner">
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                      {timerParts.mins}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Mins</div>
                  </div>
                  <span className="text-2xl font-black text-emerald-400 animate-pulse">:</span>
                  <div className="bg-slate-800/90 rounded-2xl px-3 sm:px-4 py-2.5 text-center min-w-[64px] shadow-inner">
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                      {timerParts.secs}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Secs</div>
                  </div>
                </div>
              ) : (
                /* Wall Clock */
                <div className="flex items-center justify-center space-x-2 font-mono">
                  <div className="bg-slate-800/90 rounded-2xl px-3 sm:px-4 py-2.5 text-center min-w-[64px] shadow-inner">
                    <div className="text-2xl sm:text-3xl font-black text-indigo-300">
                      {wallClock.hrs}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Hours</div>
                  </div>
                  <span className="text-2xl font-black text-indigo-300 animate-pulse">:</span>
                  <div className="bg-slate-800/90 rounded-2xl px-3 sm:px-4 py-2.5 text-center min-w-[64px] shadow-inner">
                    <div className="text-2xl sm:text-3xl font-black text-indigo-300">
                      {wallClock.mins}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Mins</div>
                  </div>
                  <span className="text-2xl font-black text-indigo-300 animate-pulse">:</span>
                  <div className="bg-slate-800/90 rounded-2xl px-3 sm:px-4 py-2.5 text-center min-w-[64px] shadow-inner">
                    <div className="text-2xl sm:text-3xl font-black text-indigo-300">
                      {wallClock.secs}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">{wallClock.ampm}</div>
                  </div>
                </div>
              )}

              {/* Progress to 8 Hours Target */}
              {todayRecord && todayRecord.status === 'In Progress' && (
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Target: 8.0h for Full Day</span>
                    <span className="text-emerald-400 font-bold">
                      {(activeTimerSeconds / 3600).toFixed(1)}h / 8.0h ({shiftProgressPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        activeTimerSeconds >= target8HoursSecs ? 'bg-emerald-400' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${shiftProgressPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SIDE-BY-SIDE CHECK-IN & CHECK-OUT BUTTONS */}
            <div>
              {/* CASE 1: NOT CHECKED IN YET -> Check In Active, Check Out Next to It (Disabled) */}
              {(!todayRecord || todayRecord.status === 'Absent') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsCheckInOpen(true)}
                    className="flex items-center justify-center space-x-2 px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-clean-md hover:shadow-clean-lg transition-all"
                  >
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>Check In for Today</span>
                  </button>

                  <button
                    disabled
                    className="flex items-center justify-center space-x-2 px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-400 bg-slate-100 cursor-not-allowed shadow-none"
                    title="Please Check-In first to activate Check-Out"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0 opacity-40" />
                    <span>Check Out</span>
                  </button>
                </div>
              )}

              {/* CASE 2: IN PROGRESS (CHECKED IN) -> Check In Pill Left, Check Out Active Button Right Next to It */}
              {todayRecord && todayRecord.status === 'In Progress' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Left: Checked-In Info */}
                  <div className="flex items-center space-x-2.5 px-3.5 py-3 rounded-2xl bg-emerald-50 text-emerald-900 shadow-clean truncate">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
                    <div className="truncate text-left">
                      <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                        In: {todayRecord.checkIn}
                      </div>
                      <div className="text-xs font-extrabold text-emerald-950 truncate">
                        {todayRecord.workType} Mode
                      </div>
                    </div>
                  </div>

                  {/* Right: Check Out Button Right Next To It */}
                  <button
                    onClick={handleCheckOut}
                    className="flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-clean-md hover:shadow-clean-lg transition-all animate-pulse"
                    title="Finish your shift and record total hours"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    <span>Check Out Now</span>
                  </button>
                </div>
              )}

              {/* CASE 3: ALREADY CHECKED OUT TODAY */}
              {todayRecord && todayRecord.status !== 'In Progress' && todayRecord.status !== 'Absent' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 flex items-center space-x-2.5 shadow-clean">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${todayRecord.status === 'Present' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <div className="truncate">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">In Time</div>
                      <div className="text-xs font-bold text-slate-800">{todayRecord.checkIn}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between text-xs font-medium text-slate-600 shadow-clean">
                    <div className="truncate">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Out ({todayRecord.hoursWorked}h)</div>
                      <div className="text-xs font-bold text-slate-800">{todayRecord.checkOut}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 flex-shrink-0">
                      Done
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Apply Leave Button */}
            <button
              onClick={() => setIsLeaveOpen(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 shadow-clean transition-all"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Apply for Leave</span>
            </button>
          </div>

          {/* 2. Compact Attendance Calendar (RIGHT BELOW SHIFT TRACKER & TIMER) */}
          <AttendanceCalendar 
            attendanceRecords={attendanceList}
            staffId={currentUser.id}
          />

        </div>

      </div>

      {/* Salary & Payslip Calculation Card */}
      <StaffSalaryCard 
        staff={currentUser}
      />

      {/* Leaves History Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-clean">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              My Leave Requests
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Track the status of your submitted leave applications
            </p>
          </div>

          <button
            onClick={() => setIsLeaveOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-navy bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Leave Application</span>
          </button>
        </div>

        {leavesList.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl mt-4">
            No leave applications recorded yet.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-2xl">Leave Type</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Days</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-2xl">Admin Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y-0 space-y-2">
                {leavesList.map(leave => (
                  <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {leave.leaveType}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {leave.startDate} to {leave.endDate}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {leave.totalDays} {leave.totalDays === 1 ? 'Day' : 'Days'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      {leave.status === 'Approved' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved</span>
                        </span>
                      )}
                      {leave.status === 'Pending' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending Approval</span>
                        </span>
                      )}
                      {leave.status === 'Rejected' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-100 text-rose-800">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Not Approved</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 italic">
                      {leave.adminRemark || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Check In Modal */}
      <CheckInModal 
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onConfirmCheckIn={handleConfirmCheckIn}
        staffName={currentUser.name}
      />

      {/* Leave Modal */}
      <LeaveRequestModal 
        isOpen={isLeaveOpen}
        onClose={() => setIsLeaveOpen(false)}
        onSubmitLeave={handleSubmitLeave}
        staff={currentUser}
      />

    </div>
  );
}
