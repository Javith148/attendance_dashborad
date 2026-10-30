import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Lock, User, Briefcase, DollarSign, Phone, Calendar, CheckCircle2, AlertCircle, Eye, EyeOff, Pencil, Check } from 'lucide-react';
import { getUsers, saveUser } from '../utils/storage';

// All Company Designations for Dropdown
const ALL_DESIGNATIONS = [
  'Senior Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'UI/UX Designer',
  'QA Automation Engineer',
  'Operations Manager',
  'Operations Executive',
  'Logistics Coordinator',
  'HR Manager',
  'HR Executive',
  'Talent Acquisition Specialist',
  'Marketing Executive',
  'Digital Marketing Specialist',
  'Senior Accountant',
  'Accounts Executive',
  'Project Coordinator',
  'Team Lead'
];

// Helper to auto-map department from designation for backend records
const getDepartmentForDesignation = (desig) => {
  if (desig.includes('Engineer') || desig.includes('Developer') || desig.includes('UI/UX')) return 'Engineering';
  if (desig.includes('HR') || desig.includes('Talent')) return 'Human Resources';
  if (desig.includes('Marketing') || desig.includes('Media')) return 'Marketing';
  if (desig.includes('Account') || desig.includes('Finance')) return 'Finance & Accounts';
  if (desig.includes('Logistics')) return 'Logistics';
  return 'Operations';
};

export default function AdminAddStaffModal({ 
  isOpen, 
  onClose, 
  onStaffAdded, 
  onSwitchToStaff,
  staffToEdit = null 
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    designation: 'Senior Software Engineer',
    salary: 50000,
    phone: '',
    joinDate: new Date().toISOString().split('T')[0]
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [createdStaff, setCreatedStaff] = useState(null);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (staffToEdit) {
        setEditingStaffId(staffToEdit.id);
        setIsEditMode(true);
        setFormData({
          name: staffToEdit.name || '',
          email: staffToEdit.email || '',
          password: staffToEdit.password || '',
          designation: staffToEdit.designation || 'Senior Software Engineer',
          salary: staffToEdit.salary || staffToEdit.monthlySalary || 50000,
          phone: staffToEdit.phone === 'Not Provided' ? '' : (staffToEdit.phone || ''),
          joinDate: staffToEdit.joinDate || new Date().toISOString().split('T')[0]
        });
        setCreatedStaff(null);
        setErrors({});
      }
    }
  }, [isOpen, staffToEdit]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) errs.name = 'Full name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address.';
    } else {
      const users = getUsers();
      const duplicate = users.find(u => u.email.toLowerCase() === formData.email.trim().toLowerCase() && u.id !== editingStaffId);
      if (duplicate) {
        errs.email = 'This email is already in use by another user.';
      }
    }
    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 3) {
      errs.password = 'Password must be at least 3 characters.';
    }
    if (!formData.designation) errs.designation = 'Please select a role.';
    if (!formData.salary || Number(formData.salary) <= 0) errs.salary = 'Enter a valid salary.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStartEdit = (staff) => {
    setEditingStaffId(staff.id);
    setIsEditMode(true);
    setFormData({
      name: staff.name || '',
      email: staff.email || '',
      password: staff.password || '',
      designation: staff.designation || 'Senior Software Engineer',
      salary: staff.salary || staff.monthlySalary || 50000,
      phone: staff.phone === 'Not Provided' ? '' : (staff.phone || ''),
      joinDate: staff.joinDate || new Date().toISOString().split('T')[0]
    });
    setCreatedStaff(null);
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const salaryNum = Number(formData.salary) || 50000;
    const dailyRate = Math.round(salaryNum / 25);
    const hourlyRate = Math.round(dailyRate / 8);
    const dept = getDepartmentForDesignation(formData.designation);

    const users = getUsers();
    const existingUser = editingStaffId ? users.find(u => u.id === editingStaffId) : null;

    const staffId = editingStaffId || `MAAS-${Math.floor(100 + Math.random() * 900)}`;
    const staffRecord = {
      ...(existingUser || {}),
      id: staffId,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: 'staff',
      department: dept,
      designation: formData.designation,
      salary: salaryNum,
      monthlySalary: salaryNum,
      dailySalary: dailyRate,
      hourlyRate: hourlyRate,
      phone: formData.phone.trim() || 'Not Provided',
      joinDate: formData.joinDate,
      avatarBg: existingUser?.avatarBg || ['bg-pink-600', 'bg-indigo-600', 'bg-amber-600', 'bg-teal-600', 'bg-emerald-600', 'bg-purple-600'][Math.floor(Math.random() * 6)]
    };

    saveUser(staffRecord);
    setCreatedStaff(staffRecord);
    setIsEditMode(false);
    setEditingStaffId(null);
    if (onStaffAdded) onStaffAdded(staffRecord);
  };

  const handleReset = () => {
    setCreatedStaff(null);
    setEditingStaffId(null);
    setIsEditMode(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      designation: 'Senior Software Engineer',
      salary: 50000,
      phone: '',
      joinDate: new Date().toISOString().split('T')[0]
    });
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-clean-lg animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${isEditMode ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-brand-navy'}`}>
              {isEditMode ? <Pencil className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditMode ? 'Edit Staff Profile' : 'Register New Staff Member'}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {isEditMode ? `Modify employee details for ${formData.name || 'staff member'}` : 'Create login credentials and employee profile'}
              </p>
            </div>
          </div>

          <button
            onClick={() => { handleReset(); onClose(); }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Success View */}
        {createdStaff ? (
          <div className="mt-3 p-5 rounded-2xl bg-slate-50 text-center space-y-3.5 shadow-clean">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-clean">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Staff Profile Created Successfully!
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                <strong>{createdStaff.name}</strong> ({createdStaff.id}) has been added.
              </p>
            </div>

            {/* Credentials Summary */}
            <div className="p-3.5 bg-white rounded-2xl text-left space-y-1.5 text-xs shadow-clean">
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-bold text-brand-navy">{createdStaff.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Password:</span>
                <span className="font-mono font-bold text-slate-800">{createdStaff.password}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Designation / Role:</span>
                <span className="font-semibold text-slate-700">{createdStaff.designation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Salary:</span>
                <span className="font-bold text-emerald-700">Rs. {createdStaff.salary?.toLocaleString('en-IN')} / month</span>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="pt-1 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => handleStartEdit(createdStaff)}
                className="flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-clean transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 shadow-clean"
              >
                Add Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-3 space-y-3">
            
            {/* Row 1: Full Name & Email Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative rounded-xl bg-slate-50">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter Name"
                    className="w-full pl-9 pr-3 py-2 bg-transparent rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  />
                </div>
                {errors.name && <p className="text-[10px] text-rose-600 mt-0.5 pl-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative rounded-xl bg-slate-50">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter Email Address"
                    className="w-full pl-9 pr-3 py-2 bg-transparent rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  />
                </div>
                {errors.email && <p className="text-[10px] text-rose-600 mt-0.5 pl-1">{errors.email}</p>}
              </div>
            </div>

            {/* Row 2: Password & Designation / Role (Dropdown) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative rounded-xl bg-slate-50">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter Password"
                    className="w-full pl-9 pr-8 py-2 bg-transparent rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-rose-600 mt-0.5 pl-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Designation / Role
                </label>
                <select
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-navy"
                >
                  {ALL_DESIGNATIONS.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                {errors.designation && <p className="text-[10px] text-rose-600 mt-0.5 pl-1">{errors.designation}</p>}
              </div>
            </div>

            {/* Row 3: Salary & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Salary
                </label>
                <div className="relative rounded-xl bg-slate-50">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="Enter Salary"
                    className="w-full pl-9 pr-3 py-2 bg-transparent rounded-xl text-xs font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  />
                </div>
                {errors.salary && <p className="text-[10px] text-rose-600 mt-0.5 pl-1">{errors.salary}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Phone
                </label>
                <div className="relative rounded-xl bg-slate-50">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter Phone Number"
                    className="w-full pl-9 pr-3 py-2 bg-transparent rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Joining Date (Compact Width) */}
            <div className="w-48 sm:w-52">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Joining Date
              </label>
              <input
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-navy"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-clean transition-all flex items-center space-x-1.5"
              >
                {isEditMode ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Staff Account</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
