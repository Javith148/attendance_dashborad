import React, { useState } from 'react';
import { Calendar, Search, Filter, Clock, Building2, Home, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDate } from '../utils/storage';

export default function AdminAttendanceLogs({ attendanceRecords, staffList }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filtered = attendanceRecords.filter(r => {
    if (selectedDate && r.date !== selectedDate) return false;
    if (selectedStaffId !== 'ALL' && r.staffId !== selectedStaffId) return false;
    if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-clean space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Company Attendance Master Logs
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Complete daily audit trail of all staff check-ins, check-outs, hours, and work modes
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl">
        
        {/* Date */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Filter by Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-xl text-xs font-semibold text-slate-800 shadow-clean focus:outline-none"
          />
        </div>

        {/* Staff Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Filter by Staff
          </label>
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-xl text-xs font-semibold text-slate-800 shadow-clean focus:outline-none"
          >
            <option value="ALL">All Staff Members</option>
            {staffList.filter(s => s.role === 'staff').map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-xl text-xs font-semibold text-slate-800 shadow-clean focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Present">Present (Full Day &gt;= 8h)</option>
            <option value="Half Day">Half Day (&lt; 8h)</option>
            <option value="Leave">Approved Leave</option>
            <option value="Absent">Absent</option>
            <option value="Holiday">Sunday Holiday</option>
            <option value="In Progress">In Progress (Active Shift)</option>
          </select>
        </div>

      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <th className="py-3 px-3.5 rounded-l-2xl">Date</th>
              <th className="py-3 px-3.5">Staff Name</th>
              <th className="py-3 px-3.5">Status</th>
              <th className="py-3 px-3.5">Check In</th>
              <th className="py-3 px-3.5">Check Out</th>
              <th className="py-3 px-3.5">Hours</th>
              <th className="py-3 px-3.5">Mode</th>
              <th className="py-3 px-3.5 rounded-r-2xl">Shift Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y-0 space-y-2">
            {filtered.slice(0, 50).map(rec => (
              <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-3.5 font-bold text-slate-800">
                  {rec.date}
                </td>
                <td className="py-3 px-3.5 font-semibold text-slate-900">
                  {rec.staffName || rec.staffId}
                </td>
                <td className="py-3 px-3.5">
                  {rec.status === 'Present' && (
                    <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-emerald-100 text-emerald-800">
                      Present (Full Day)
                    </span>
                  )}
                  {rec.status === 'Half Day' && (
                    <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-amber-100 text-amber-800">
                      Half Day (&lt; 8h)
                    </span>
                  )}
                  {rec.status === 'Leave' && (
                    <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-indigo-100 text-indigo-800">
                      Approved Leave
                    </span>
                  )}
                  {rec.status === 'Holiday' && (
                    <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-violet-100 text-violet-800">
                      Sunday Holiday
                    </span>
                  )}
                  {rec.status === 'Absent' && (
                    <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-rose-100 text-rose-800">
                      Absent
                    </span>
                  )}
                  {rec.status === 'In Progress' && (
                    <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-sky-200 text-sky-800 animate-pulse">
                      Active Shift
                    </span>
                  )}
                </td>
                <td className="py-3 px-3.5 text-slate-600 font-mono">
                  {rec.checkIn || '—'}
                </td>
                <td className="py-3 px-3.5 text-slate-600 font-mono">
                  {rec.checkOut || '—'}
                </td>
                <td className="py-3 px-3.5 font-bold text-brand-navy">
                  {rec.hoursWorked ? `${rec.hoursWorked} hrs` : '—'}
                </td>
                <td className="py-3 px-3.5 text-slate-600">
                  {rec.workType || '—'}
                </td>
                <td className="py-3 px-3.5 text-slate-400 italic max-w-xs truncate" title={rec.notes}>
                  {rec.notes || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
