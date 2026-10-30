import React, { useState } from 'react';
import { X, Calendar, FileText, Send, AlertCircle, Info } from 'lucide-react';
import { formatDate } from '../utils/storage';

export default function LeaveRequestModal({ isOpen, onClose, onSubmitLeave, staff }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatDate(tomorrow);

  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState(tomorrowStr);
  const [endDate, setEndDate] = useState(tomorrowStr);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Calculate days
  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalDays = calculateDays();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot precede the start date.');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a specific reason for your leave application.');
      return;
    }

    onSubmitLeave({
      staffId: staff.id,
      staffName: staff.name,
      department: staff.department,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason: reason.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-clean-lg animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-brand-navy">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Apply for Leave
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Submit a leave request for administrative review
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3.5 rounded-2xl bg-rose-50 flex items-center space-x-2 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Leave Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Leave Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'Casual Leave', desc: 'Personal errands / family' },
                { type: 'Sick Leave', desc: 'Health / medical rest' },
                { type: 'Emergency Leave', desc: 'Urgent unplanned events' },
                { type: 'Privilege Leave', desc: 'Earned paid annual leave' }
              ].map(item => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setLeaveType(item.type)}
                  className={`p-3 rounded-2xl text-left transition-all ${
                    leaveType === item.type
                      ? 'bg-brand-navy text-white shadow-clean-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-bold">{item.type}</div>
                  <div className={`text-[10px] ${leaveType === item.type ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dates Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-50 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-50 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>
          </div>

          {/* Days summary pill */}
          <div className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Computed Duration:</span>
            <span className="font-bold text-brand-navy">
              {totalDays > 0 ? `${totalDays} ${totalDays === 1 ? 'Working Day' : 'Working Days'}` : 'Invalid range'}
            </span>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Reason for Absence
            </label>
            <div className="relative rounded-2xl bg-slate-50">
              <div className="absolute top-3.5 left-4 pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please state clear reasons for HR & manager approval..."
                className="w-full pl-11 pr-4 py-3 bg-transparent rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none"
                required
              />
            </div>
          </div>

          {/* Notice */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 text-slate-700 text-xs">
            <span className="font-bold text-brand-navy">Approval Workflow: </span>
            Your request will appear in the Admin Leaves Approval queue. Once approved by administration, it will reflect on your attendance record and salary statement.
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={totalDays <= 0}
              className="px-6 py-3 rounded-2xl text-xs font-semibold text-white bg-brand-navy hover:bg-brand-navyLight shadow-clean-md transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Submit Application</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

