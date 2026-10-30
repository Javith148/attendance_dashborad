import * as XLSX from 'xlsx';
import { calculateStaffSalary } from './storage';

export function exportPayrollToExcel(staffList, year, month) {
  const dataRows = staffList.map((staff, idx) => {
    const salary = calculateStaffSalary(staff, year, month);
    return {
      'S.No': idx + 1,
      'Staff ID': salary.staffId,
      'Full Name': salary.staffName,
      'Department': salary.department,
      'Designation': salary.designation,
      'Total Hours Worked': salary.totalHours,
      'Full Days (>= 8h)': salary.fullDays,
      'Half Days (< 8h)': salary.halfDays,
      'Approved Leaves': salary.approvedLeaves,
      'Absent Days': salary.absentDays,
      'Effective Paid Days': salary.effectiveDays,
      'Basic Earned (INR)': salary.grossSalary,
      'HRA (15%)': salary.hra,
      'Conveyance Allowance': salary.conveyance,
      'Total Earnings (INR)': salary.totalEarnings,
      'PF Deduction (12%)': salary.pf,
      'Prof. Tax': salary.professionalTax,
      'Total Deductions': salary.totalDeductions,
      'Net Salary Payable (INR)': salary.netPayable
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dataRows);

  // Set column widths
  const colWidths = [
    { wch: 6 },  // S.No
    { wch: 12 }, // ID
    { wch: 22 }, // Name
    { wch: 16 }, // Dept
    { wch: 26 }, // Desig
    { wch: 18 }, // Total Hours
    { wch: 16 }, // Full Days
    { wch: 16 }, // Half Days
    { wch: 16 }, // Leaves
    { wch: 14 }, // Absent
    { wch: 18 }, // Effective Days
    { wch: 18 }, // Basic
    { wch: 14 }, // HRA
    { wch: 20 }, // Conveyance
    { wch: 18 }, // Total Earnings
    { wch: 18 }, // PF
    { wch: 12 }, // Tax
    { wch: 16 }, // Total Deductions
    { wch: 22 }  // Net Payable
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  const monthName = dataRows[0] ? calculateStaffSalary(staffList[0], year, month).monthName : 'Month';
  XLSX.utils.book_append_sheet(workbook, worksheet, `Payroll_${monthName}_${year || new Date().getFullYear()}`);

  const fileName = `MAAS_Payroll_Report_${monthName}_${year || new Date().getFullYear()}.xlsx`;
  XLSX.writeFile(workbook, fileName);
  return fileName;
}

export function exportSingleStaffToExcel(staff, year, month) {
  return exportPayrollToExcel([staff], year, month);
}

