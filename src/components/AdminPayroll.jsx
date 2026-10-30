import React, { useState } from 'react';
import { 
  DollarSign, Download, Mail, FileSpreadsheet, CheckCircle2, 
  AlertCircle, Search, Calendar, Clock, Send, User 
} from 'lucide-react';
import { calculateStaffSalary } from '../utils/storage';
import { generateSalarySlipPdf } from '../utils/pdfExport';
import { exportPayrollToExcel, exportSingleStaffToExcel } from '../utils/excelExport';
import { getSmtpConfig, sendSalarySlipEmail } from '../utils/emailService';

export default function AdminPayroll({ staffList }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingAction, setLoadingAction] = useState(null);
  const [statusNotification, setStatusNotification] = useState(null);

  const activeStaff = staffList.filter(s => s.role === 'staff');

  const filteredStaff = activeStaff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Bulk Excel Export
  const handleExportAllExcel = () => {
    try {
      const fileName = exportPayrollToExcel(activeStaff, selectedYear, selectedMonth);
      showNotice('success', `Exported organization payroll spreadsheet: ${fileName}`);
    } catch (err) {
      showNotice('error', 'Failed to generate Excel file: ' + err.message);
    }
  };

  // Single Staff Excel Export
  const handleExportSingleExcel = (staff) => {
    try {
      const fileName = exportSingleStaffToExcel(staff, selectedYear, selectedMonth);
      showNotice('success', `Exported Excel sheet for ${staff.name}: ${fileName}`);
    } catch (err) {
      showNotice('error', 'Failed to export Excel: ' + err.message);
    }
  };

  // Single Staff PDF Payslip Export
  const handleDownloadPdf = (staff) => {
    const salary = calculateStaffSalary(staff, selectedYear, selectedMonth);
    setLoadingAction(`pdf-${staff.id}`);
    setTimeout(() => {
      try {
        generateSalarySlipPdf(salary);
        showNotice('success', `PDF Salary Slip downloaded for ${staff.name}`);
      } catch (err) {
        showNotice('error', 'Error creating PDF: ' + err.message);
      } finally {
        setLoadingAction(null);
      }
    }, 300);
  };

  // Send SMTP Email
  const handleSendEmail = async (staff) => {
    const salary = calculateStaffSalary(staff, selectedYear, selectedMonth);
    const smtpConfig = getSmtpConfig();
    setLoadingAction(`email-${staff.id}`);

    try {
      const res = await sendSalarySlipEmail(salary, smtpConfig);
      showNotice('success', `Official PDF Payslip emailed successfully to ${salary.email} and javithjavi148@gmail.com!`);
    } catch (err) {
      showNotice('error', `Could not send email: ${err.message || 'SMTP transmission error'}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const showNotice = (type, message) => {
    setStatusNotification({ type, message });
    setTimeout(() => setStatusNotification(null), 5000);
  };

  // Total summary figures for current month
  let totalOrgPayroll = 0;
  let totalOrgHours = 0;
  activeStaff.forEach(s => {
    const sal = calculateStaffSalary(s, selectedYear, selectedMonth);
    totalOrgPayroll += sal.netPayable;
    totalOrgHours += sal.totalHours;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Notice */}
      {statusNotification && (
        <div className={`p-4 rounded-2xl shadow-clean-md flex items-center space-x-3 text-xs font-semibold animate-in slide-in-from-top-4 duration-300 ${
          statusNotification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          {statusNotification.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{statusNotification.message}</span>
        </div>
      )}

      {/* Top Banner & Action Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-clean">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Staff Salary & Payroll Management
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Hourly calculations, day rates, Excel reports and PDF payslip downloads
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Download Excel Sheet */}
            <button
              onClick={handleExportAllExcel}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200/80 shadow-clean transition-all"
              title="Download Excel Sheet for all staff"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Export Payroll to Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Filters and Month Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-4 border-t-0 bg-slate-50 p-4 rounded-2xl">
          
          {/* Month Selector */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Payroll Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white rounded-xl text-xs font-semibold text-slate-800 shadow-clean focus:outline-none"
            >
              {monthNames.map((name, idx) => (
                <option key={name} value={idx}>{name}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white rounded-xl text-xs font-semibold text-slate-800 shadow-clean focus:outline-none"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          {/* Search */}
          <div className="sm:col-span-7">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Search Staff
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff by name, employee ID, or department..."
                className="w-full pl-9 pr-4 py-2 bg-white rounded-xl text-xs text-slate-900 placeholder-slate-400 shadow-clean focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* Quick Org Totals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Staff Count</span>
            <span className="text-base font-bold text-slate-900">{activeStaff.length} Employees</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Hours Logged</span>
            <span className="text-base font-bold text-brand-navy">{totalOrgHours.toFixed(1)} Hours</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Month Payroll Total</span>
            <span className="text-base font-bold text-emerald-600">Rs. {totalOrgPayroll.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Pay Period</span>
            <span className="text-base font-bold text-indigo-700">{monthNames[selectedMonth]} {selectedYear}</span>
          </div>
        </div>

        {/* Staff Salary Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-3 rounded-l-2xl">Staff</th>
                <th className="py-3 px-3">Dept</th>
                <th className="py-3 px-3">Hours Worked</th>
                <th className="py-3 px-3">Full / Half Days</th>
                <th className="py-3 px-3">Gross Salary</th>
                <th className="py-3 px-3">Net Take-Home</th>
                <th className="py-3 px-3 rounded-r-2xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-0 space-y-2">
              {filteredStaff.map(staff => {
                const salary = calculateStaffSalary(staff, selectedYear, selectedMonth);
                const isPdfLoading = loadingAction === `pdf-${staff.id}`;
                const isEmailLoading = loadingAction === `email-${staff.id}`;

                return (
                  <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Staff Name & ID */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold ${staff.avatarBg || 'bg-brand-navy'}`}>
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{staff.name}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{staff.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-3 font-medium text-slate-600">
                      {staff.department}
                    </td>

                    {/* Hours */}
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-brand-navy bg-indigo-50 px-2 py-0.5 rounded-lg">
                        {salary.totalHours} hrs
                      </span>
                    </td>

                    {/* Full / Half */}
                    <td className="py-3.5 px-3 text-slate-700 font-medium">
                      <span>{salary.fullDays} Full</span>
                      <span className="text-slate-400 mx-1">•</span>
                      <span className="text-amber-600">{salary.halfDays} Half</span>
                    </td>

                    {/* Gross */}
                    <td className="py-3.5 px-3 font-semibold text-slate-800">
                      Rs. {salary.grossSalary.toLocaleString('en-IN')}
                    </td>

                    {/* Net */}
                    <td className="py-3.5 px-3 font-extrabold text-emerald-700">
                      Rs. {salary.netPayable.toLocaleString('en-IN')}
                    </td>

                    {/* Actions: Download Excel, Download PDF, Send SMTP */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        
                        {/* Download Excel */}
                        <button
                          onClick={() => handleExportSingleExcel(staff)}
                          className="p-2 rounded-xl text-emerald-700 hover:bg-emerald-50 transition-colors shadow-clean"
                          title="Download Staff Payroll Excel (.xlsx)"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>

                        {/* Download PDF */}
                        <button
                          onClick={() => handleDownloadPdf(staff)}
                          disabled={isPdfLoading}
                          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-brand-navy hover:bg-indigo-50 transition-colors shadow-clean disabled:opacity-50"
                          title="Download PDF Salary Slip"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">{isPdfLoading ? '...' : 'PDF'}</span>
                        </button>

                        {/* Send via SMTP Email */}
                        <button
                          onClick={() => handleSendEmail(staff)}
                          disabled={isEmailLoading}
                          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors shadow-clean disabled:opacity-50"
                          title="Send Salary Slip to Staff via SMTP Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">{isEmailLoading ? 'Sending...' : 'Email'}</span>
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

