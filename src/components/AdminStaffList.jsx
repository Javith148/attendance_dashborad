import React, { useState } from 'react';
import { UserPlus, Search, User, Mail, LogIn, Trash2, Briefcase, Phone, Pencil } from 'lucide-react';
import { deleteUser } from '../utils/storage';

export default function AdminStaffList({ staffList, onOpenAddStaff, onSwitchToStaff, onRefreshData, onEditStaff }) {
  const [search, setSearch] = useState('');

  const activeStaff = staffList.filter(s => s.role === 'staff');

  const filtered = activeStaff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (staff) => {
    if (window.confirm(`Are you sure you want to remove ${staff.name} (${staff.id}) from the system?`)) {
      deleteUser(staff.id);
      if (onRefreshData) onRefreshData();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-clean space-y-6">
      
      {/* Header and Add Staff Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Staff Directory & Access Management
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Create new staff accounts, manage credentials and launch staff sessions
          </p>
        </div>

        <button
          onClick={onOpenAddStaff}
          className="flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-clean-md transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter staff by name, email, employee ID, or department..."
          className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
        />
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(staff => {
          return (
            <div 
              key={staff.id} 
              className="p-5 rounded-2xl bg-slate-50 hover:bg-white shadow-clean transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white text-base font-bold shadow-clean ${staff.avatarBg || 'bg-brand-navy'}`}>
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {staff.name}
                      </h4>
                      <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md mt-0.5 inline-block">
                        {staff.id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEditStaff && onEditStaff(staff)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit Staff Profile"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(staff)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove Staff"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3.5 space-y-1.5 text-xs">
                  <div className="text-slate-600 font-medium">
                    <span className="text-slate-400">Role:</span> {staff.designation}
                  </div>
                  <div className="text-slate-600 font-medium">
                    <span className="text-slate-400">Dept:</span> {staff.department}
                  </div>
                  <div className="text-slate-600 font-medium">
                    <span className="text-slate-400">Email:</span> {staff.email}
                  </div>

                  {/* Salary info */}
                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Salary:</span>
                    <span className="font-bold text-emerald-700">Rs. {(staff.salary || staff.monthlySalary || (staff.dailySalary * 25)).toLocaleString('en-IN')} / month</span>
                  </div>
                </div>
              </div>

              {/* Action: Switch to this staff dashboard */}
              <button
                onClick={() => onSwitchToStaff(staff)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold text-brand-navy bg-white hover:bg-indigo-50/70 shadow-clean transition-all"
                title="Launch staff dashboard directly"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In To Staff Dashboard</span>
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}

