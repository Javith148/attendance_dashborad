import React, { useState, useEffect } from 'react';
import { X, Clock, Building2, Home, FileText, CheckCircle2 } from 'lucide-react';

export default function CheckInModal({ isOpen, onClose, onConfirmCheckIn, staffName }) {
  const [workType, setWorkType] = useState('Office');
  const [customTime, setCustomTime] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-fill current time on open
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      setCustomTime(timeStr);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmCheckIn({
      workType,
      checkInTime: customTime,
      notes: notes.trim() || `${workType} Shift - Regular Tasks`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-clean-lg animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 flex items-center justify-center text-brand-navy">
              <Clock className="w-4 h-4 text-brand-navy" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Staff Check-In
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {staffName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* 1. Work Location Mode */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Work Location Mode
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setWorkType('Office')}
                className={`py-2.5 px-3 rounded-2xl flex items-center justify-center space-x-2 transition-all ${
                  workType === 'Office'
                    ? 'bg-brand-navy text-white shadow-clean font-bold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-xs">Office</span>
              </button>

              <button
                type="button"
                onClick={() => setWorkType('WFH')}
                className={`py-2.5 px-3 rounded-2xl flex items-center justify-center space-x-2 transition-all ${
                  workType === 'WFH'
                    ? 'bg-brand-navy text-white shadow-clean font-bold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="text-xs">WFH</span>
              </button>
            </div>
          </div>

          {/* 2. Check-In Time */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Check-In Time
            </label>
            <div className="relative rounded-2xl bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-navy transition-all">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Clock className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                placeholder="09:00 AM"
                className="w-full pl-10 pr-3.5 py-2.5 bg-transparent rounded-2xl text-xs font-bold text-slate-800 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* 3. Primary Task / Daily Objective */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Primary Task / Daily Objective
            </label>
            <div className="relative rounded-2xl bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-navy transition-all">
              <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter today's key focus or tasks..."
                className="w-full pl-10 pr-3.5 py-2.5 bg-transparent rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-clean transition-all flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm & Check In</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
