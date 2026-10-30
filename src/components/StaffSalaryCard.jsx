import React, { useState } from 'react';
import { DollarSign, Download, Mail, CheckCircle2, Clock, Calendar, ShieldCheck, ChevronRight, AlertCircle } from 'lucide-react';
import { calculateStaffSalary } from '../utils/storage';
import { generateSalarySlipPdf } from '../utils/pdfExport';
import { getSmtpConfig, sendSalarySlipEmail } from '../utils/emailService';

export default function StaffSalaryCard({ staff }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  const today = new Date();
  const salaryData = calculateStaffSalary(staff, today.getFullYear(), today.getMonth());

  // Handle PDF Download
  const handleDownloadPdf = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        generateSalarySlipPdf(salaryData);
      } catch (err) {
        console.error('PDF error:', err);
      } finally {
        setIsExporting(false);
      }
    }, 400);
  };

  // Handle Send via Email
  const handleSendEmail = async () => {
    setIsSendingMail(true);
    setEmailStatus(null);
    const smtpConfig = getSmtpConfig();

    try {
      const res = await sendSalarySlipEmail(salaryData, smtpConfig);
      setEmailStatus({
        type: 'success',
        message: `Official Salary Payslip PDF emailed successfully to ${salaryData.email} and javithjavi148@gmail.com!`
      });
    } catch (err) {
      setEmailStatus({
        type: 'error',
        message: `Email dispatch failed: ${err.message || 'Check network / SMTP connection'}`
      });
    } finally {
      setIsSendingMail(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-clean">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-0">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-brand-navy bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Monthly Earnings & Payslip
            </span>
            <span className="text-xs text-slate-400">
              {salaryData.monthName} {salaryData.year}
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-1">
            Salary Computation & Statement
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-white bg-brand-navy hover:bg-brand-navyLight shadow-clean transition-all disabled:opacity-60"
            title="Download PDF Salary Slip"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating PDF...' : 'Download Payslip PDF'}</span>
          </button>

          <button
            onClick={handleSendEmail}
            disabled={isSendingMail}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 shadow-clean transition-all disabled:opacity-60"
            title="Send Salary Slip via SMTP Email"
          >
            <Mail className="w-4 h-4 text-indigo-600" />
            <span>{isSendingMail ? 'Sending via SMTP...' : 'Email My Payslip'}</span>
          </button>
        </div>
      </div>

      {/* Email Status Alert */}
      {emailStatus && (
        <div className={`mt-4 p-3.5 rounded-2xl flex items-center space-x-3 text-xs font-medium ${
          emailStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
        }`}>
          {emailStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          )}
          <span>{emailStatus.message}</span>
        </div>
      )}

      {/* Primary Figures Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        
        {/* Total Working Hours */}
        <div className="p-4 rounded-2xl bg-slate-50 shadow-clean">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Hours Worked</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {salaryData.totalHours} <span className="text-xs font-semibold text-slate-400">hours</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Rate: Rs. {salaryData.hourlyRate} / hour
          </div>
        </div>

        {/* Days Count */}
        <div className="p-4 rounded-2xl bg-slate-50 shadow-clean">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Present Days</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {salaryData.fullDays} <span className="text-xs font-semibold text-slate-400">Full</span>
            <span className="text-sm font-normal text-slate-400 mx-1.5">+</span>
            {salaryData.halfDays} <span className="text-xs font-semibold text-slate-400">Half</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Daily Base: Rs. {salaryData.dailySalary} / day
          </div>
        </div>

        {/* Gross Earnings */}
        <div className="p-4 rounded-2xl bg-slate-50 shadow-clean">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            Rs. {salaryData.totalEarnings.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Basic + HRA + Conveyance
          </div>
        </div>

        {/* Net Salary Payable */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 shadow-clean">
          <div className="flex items-center justify-between text-brand-navy mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Net Take-Home</span>
            <ShieldCheck className="w-4 h-4 text-brand-navy" />
          </div>
          <div className="text-2xl font-extrabold text-brand-navy">
            Rs. {salaryData.netPayable.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-indigo-700/80 font-medium mt-1">
            Deductions: Rs. {salaryData.totalDeductions.toLocaleString('en-IN')}
          </div>
        </div>

      </div>

      {/* Salary Breakdown Table (Clean, No Harsh Borders) */}
      <div className="mt-6 p-5 rounded-2xl bg-slate-50 shadow-clean">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
          Detailed Earnings & Deductions Breakdown
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          {/* Earnings */}
          <div className="space-y-2.5">
            <div className="font-bold text-slate-600 pb-1 flex justify-between">
              <span>Earnings Component</span>
              <span>Amount</span>
            </div>
            
            <div className="flex justify-between py-1 text-slate-700 bg-white px-3 py-2 rounded-xl shadow-clean">
              <span>Basic Hourly/Day Pay ({salaryData.effectiveDays} effective days)</span>
              <span className="font-semibold text-slate-900">Rs. {salaryData.grossSalary.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between py-1 text-slate-700 bg-white px-3 py-2 rounded-xl shadow-clean">
              <span>House Rent Allowance (HRA 15%)</span>
              <span className="font-semibold text-slate-900">Rs. {salaryData.hra.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between py-1 text-slate-700 bg-white px-3 py-2 rounded-xl shadow-clean">
              <span>Conveyance & Medical Allowance</span>
              <span className="font-semibold text-slate-900">Rs. {salaryData.conveyance.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between py-2 text-emerald-700 bg-emerald-50/60 px-3 rounded-xl font-bold">
              <span>Total Earnings (A)</span>
              <span>Rs. {salaryData.totalEarnings.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-2.5">
            <div className="font-bold text-slate-600 pb-1 flex justify-between">
              <span>Deductions Component</span>
              <span>Amount</span>
            </div>

            <div className="flex justify-between py-1 text-slate-700 bg-white px-3 py-2 rounded-xl shadow-clean">
              <span>Provident Fund (PF 12%)</span>
              <span className="font-semibold text-slate-900">Rs. {salaryData.pf.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between py-1 text-slate-700 bg-white px-3 py-2 rounded-xl shadow-clean">
              <span>Professional Tax</span>
              <span className="font-semibold text-slate-900">Rs. {salaryData.professionalTax.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between py-1 text-slate-700 bg-white px-3 py-2 rounded-xl shadow-clean">
              <span>Unpaid Leave / Half Day Penalties</span>
              <span className="font-semibold text-slate-900">Rs. 0</span>
            </div>

            <div className="flex justify-between py-2 text-rose-700 bg-rose-50/60 px-3 rounded-xl font-bold">
              <span>Total Deductions (B)</span>
              <span>Rs. {salaryData.totalDeductions.toLocaleString('en-IN')}</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

