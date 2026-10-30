import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Calendar as CalendarIcon, Info, Home, Building2, AlertCircle } from 'lucide-react';
import { formatDate } from '../utils/storage';

export default function AttendanceCalendar({ attendanceRecords, staffId, onSelectDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayRecord, setSelectedDayRecord] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // First day of month and total days
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Day of week for 1st day (Monday = 0, Sunday = 6)
  let startOffset = firstDayOfMonth.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayRecord(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayRecord(null);
  };

  // Find record for a specific day
  const getDayRecord = (day) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return attendanceRecords.find(r => r.staffId === staffId && r.date === dStr);
  };

  const todayStr = formatDate(new Date());

  // Generate calendar grid slots
  const gridSlots = [];
  for (let i = 0; i < startOffset; i++) {
    gridSlots.push({ type: 'empty', key: `empty-${i}` });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dObj = new Date(year, month, day);
    const isSunday = dObj.getDay() === 0;
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = getDayRecord(day);
    const isToday = dStr === todayStr;
    const isFuture = dObj > new Date();

    gridSlots.push({
      type: 'day',
      key: `day-${day}`,
      day,
      dateStr: dStr,
      isSunday,
      record,
      isToday,
      isFuture
    });
  }

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-clean">
      
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            <span>Attendance Calendar</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
            Daily logs, leaves, and holidays overview
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-xl">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white shadow-clean transition-all"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 px-2 min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white shadow-clean transition-all"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels (Monday to Sunday) */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => (
          <div 
            key={dayName} 
            className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider py-1 ${idx === 6 ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {gridSlots.map((slot) => {
          if (slot.type === 'empty') {
            return (
              <div 
                key={slot.key} 
                className="h-14 sm:h-16 rounded-xl bg-slate-50/50 opacity-40" 
              />
            );
          }

          const { day, isSunday, record, isToday, isFuture, dateStr } = slot;

          // Status determination
          let statusStyle = 'bg-slate-50 text-slate-700';
          let statusLabel = '';
          let badgeColor = '';

          if (isSunday) {
            statusStyle = 'bg-violet-50/70 text-violet-800';
            statusLabel = 'Sun';
            badgeColor = 'bg-violet-200/80 text-violet-800 font-bold';
          } else if (record) {
            if (record.status === 'Present') {
              statusStyle = 'bg-emerald-50 text-emerald-900';
              statusLabel = `${record.hoursWorked ? Math.round(record.hoursWorked * 10) / 10 : 8}h Present`;
              badgeColor = 'bg-emerald-100 text-emerald-800 font-bold';
            } else if (record.status === 'Half Day') {
              statusStyle = 'bg-amber-50 text-amber-900';
              statusLabel = `${record.hoursWorked ? Math.round(record.hoursWorked * 10) / 10 : 4}h Half`;
              badgeColor = 'bg-amber-100 text-amber-800 font-bold';
            } else if (record.status === 'Leave') {
              statusStyle = 'bg-indigo-50 text-indigo-900';
              statusLabel = 'Leave';
              badgeColor = 'bg-indigo-100 text-indigo-800 font-bold';
            } else if (record.status === 'Absent') {
              statusStyle = 'bg-rose-50 text-rose-900';
              statusLabel = 'Absent';
              badgeColor = 'bg-rose-100 text-rose-800 font-bold';
            } else if (record.status === 'In Progress') {
              statusStyle = 'bg-sky-50 text-sky-900';
              statusLabel = 'Working';
              badgeColor = 'bg-sky-200 text-sky-800 font-bold animate-pulse';
            }
          } else if (isFuture) {
            statusStyle = 'bg-slate-50/60 text-slate-400';
            statusLabel = '';
          } else {
            // Past day with no record
            statusStyle = 'bg-slate-50 text-slate-500';
            statusLabel = 'Off';
            badgeColor = 'bg-slate-200 text-slate-600';
          }

          const isSelected = selectedDayRecord && selectedDayRecord.date === dateStr;

          return (
            <div
              key={slot.key}
              onClick={() => {
                setSelectedDayRecord({
                  day,
                  date: dateStr,
                  isSunday,
                  record,
                  isToday
                });
                if (onSelectDate) onSelectDate(dateStr, record);
              }}
              className={`h-14 sm:h-16 p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer flex flex-col justify-between ${statusStyle} ${
                isSelected ? 'ring-2 ring-indigo-600 shadow-clean-md' : 'hover:shadow-clean'
              } ${isToday ? 'ring-2 ring-brand-navy shadow-clean' : ''}`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${
                  isToday ? 'w-5 h-5 rounded-full bg-brand-navy text-white flex items-center justify-center text-[10px]' : ''
                }`}>
                  {day}
                </span>

                {isToday && (
                  <span className="text-[8px] uppercase font-bold tracking-wider text-brand-navy bg-white/90 px-1 py-0.2 rounded">
                    Today
                  </span>
                )}
                {isSunday && !isToday && (
                  <span className="text-[9px] font-bold text-violet-700">
                    Sun
                  </span>
                )}
              </div>

              {/* Status Badge */}
              <div className="mt-0.5">
                {statusLabel && (
                  <div className={`text-[9px] sm:text-[10px] px-1 py-0.5 rounded text-center truncate ${badgeColor}`}>
                    {statusLabel}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Inspector */}
      {selectedDayRecord && (
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-clean animate-in fade-in duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-clean text-indigo-600 font-bold text-xs">
              {selectedDayRecord.day}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">
                {selectedDayRecord.date} {selectedDayRecord.isSunday ? '• Sunday Holiday' : ''}
              </div>
              <div className="text-[11px] text-slate-500">
                {selectedDayRecord.record ? (
                  <span>
                    Status: <strong className="text-slate-800">{selectedDayRecord.record.status}</strong> 
                    {selectedDayRecord.record.checkIn && ` • In: ${selectedDayRecord.record.checkIn}`}
                    {selectedDayRecord.record.checkOut && ` • Out: ${selectedDayRecord.record.checkOut}`}
                    {selectedDayRecord.record.hoursWorked > 0 && ` • (${selectedDayRecord.record.hoursWorked}h)`}
                    {selectedDayRecord.record.workType && ` • ${selectedDayRecord.record.workType}`}
                  </span>
                ) : selectedDayRecord.isSunday ? (
                  <span>Official Weekly Holiday.</span>
                ) : (
                  <span>No check-in recorded.</span>
                )}
              </div>
            </div>
          </div>

          {selectedDayRecord.record?.notes && (
            <div className="text-[11px] text-slate-600 italic bg-white px-2.5 py-1 rounded-xl shadow-clean">
              "{selectedDayRecord.record.notes}"
            </div>
          )}
        </div>
      )}

      {/* Compact Legend */}
      <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Present (8h+)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Half Day (&lt; 8h)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Leave</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            <span>Sunday</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Absent</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-medium">
          Policy: 8h+ = Full Day | &lt; 8h = Half Day
        </div>
      </div>

    </div>
  );
}
