import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { MAAS_LOGO_BASE64 } from './logoBase64';

export function buildSalarySlipPdfDoc(salaryData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 14;

  // Add Company Logo if available
  try {
    if (MAAS_LOGO_BASE64) {
      doc.addImage(MAAS_LOGO_BASE64, 'JPEG', 14, currentY, 48, 16);
    }
  } catch (e) {
    console.warn('Could not render logo in PDF:', e);
  }

  // Header Company Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(26, 35, 126); // Deep Navy
  doc.text('MAAS GROUP OF COMPANIES', pageWidth - 14, currentY + 6, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Global Headquarters | Corporate HR & Payroll Division', pageWidth - 14, currentY + 11, { align: 'right' });
  doc.text('GSTIN: 33AAACM1234F1Z9 | payroll@maasgroup.com', pageWidth - 14, currentY + 16, { align: 'right' });

  currentY += 26;

  // Title Box (Soft Filled, No Harsh Border)
  doc.setFillColor(241, 245, 249); // Soft Slate-100
  doc.roundedRect(14, currentY, pageWidth - 28, 12, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `CONFIDENTIAL SALARY PAYSLIP - ${salaryData.monthName.toUpperCase()} ${salaryData.year}`,
    pageWidth / 2,
    currentY + 7.5,
    { align: 'center' }
  );

  currentY += 18;

  // Employee Information Grid
  doc.autoTable({
    startY: currentY,
    margin: { left: 14, right: 14 },
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: 2.5,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [100, 116, 139], cellWidth: 38 },
      1: { cellWidth: 55 },
      2: { fontStyle: 'bold', textColor: [100, 116, 139], cellWidth: 38 },
      3: { cellWidth: 'auto' }
    },
    body: [
      ['Employee Name:', salaryData.staffName, 'Employee ID:', salaryData.staffId],
      ['Department:', salaryData.department, 'Designation:', salaryData.designation],
      ['Email Address:', salaryData.email, 'Contact Phone:', salaryData.phone || 'N/A'],
      ['Date of Joining:', salaryData.joinDate, 'Pay Period:', `${salaryData.monthName} ${salaryData.year}`]
    ]
  });

  currentY = doc.lastAutoTable.finalY + 4;

  // Attendance & Hours Summary Section
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, pageWidth - 28, 18, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  const colStep = (pageWidth - 28) / 5;
  const metricsY = currentY + 6;

  doc.text('TOTAL HOURS', 14 + colStep * 0.5, metricsY, { align: 'center' });
  doc.text('FULL DAYS', 14 + colStep * 1.5, metricsY, { align: 'center' });
  doc.text('HALF DAYS', 14 + colStep * 2.5, metricsY, { align: 'center' });
  doc.text('APPROVED LEAVES', 14 + colStep * 3.5, metricsY, { align: 'center' });
  doc.text('ABSENT DAYS', 14 + colStep * 4.5, metricsY, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(26, 35, 126);
  const valY = currentY + 13;

  doc.text(`${salaryData.totalHours} hrs`, 14 + colStep * 0.5, valY, { align: 'center' });
  doc.text(`${salaryData.fullDays}`, 14 + colStep * 1.5, valY, { align: 'center' });
  doc.text(`${salaryData.halfDays}`, 14 + colStep * 2.5, valY, { align: 'center' });
  doc.text(`${salaryData.approvedLeaves}`, 14 + colStep * 3.5, valY, { align: 'center' });
  doc.text(`${salaryData.absentDays}`, 14 + colStep * 4.5, valY, { align: 'center' });

  currentY += 24;

  // Earnings & Deductions Table
  doc.autoTable({
    startY: currentY,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    headStyles: {
      fillColor: [26, 35, 126], // MAAS Navy
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9.5,
      cellPadding: 3.5
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { halign: 'right', cellWidth: 36 },
      2: { cellWidth: 55 },
      3: { halign: 'right', cellWidth: 'auto' }
    },
    head: [['Earnings Head', 'Amount (INR)', 'Deductions Head', 'Amount (INR)']],
    body: [
      [
        `Basic Pay (${salaryData.totalHours} hrs / ${salaryData.effectiveDays} days)`,
        `Rs. ${salaryData.grossSalary.toLocaleString('en-IN')}`,
        'Provident Fund (PF 12%)',
        `Rs. ${salaryData.pf.toLocaleString('en-IN')}`
      ],
      [
        'House Rent Allowance (HRA)',
        `Rs. ${salaryData.hra.toLocaleString('en-IN')}`,
        'Professional Tax',
        `Rs. ${salaryData.professionalTax.toLocaleString('en-IN')}`
      ],
      [
        'Conveyance & Medical Allowance',
        `Rs. ${salaryData.conveyance.toLocaleString('en-IN')}`,
        'Unpaid Absence Deduction',
        `Rs. 0`
      ],
      [
        'Overtime / Bonus Incentives',
        'Rs. 0',
        'Other Deductions',
        'Rs. 0'
      ]
    ]
  });

  currentY = doc.lastAutoTable.finalY + 3;

  // Subtotals
  doc.autoTable({
    startY: currentY,
    margin: { left: 14, right: 14 },
    theme: 'plain',
    styles: {
      fontSize: 9.5,
      fontStyle: 'bold',
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 55, textColor: [30, 41, 59] },
      1: { halign: 'right', cellWidth: 36, textColor: [16, 185, 129] },
      2: { cellWidth: 55, textColor: [30, 41, 59] },
      3: { halign: 'right', cellWidth: 'auto', textColor: [239, 68, 68] }
    },
    body: [
      [
        'Total Earnings (A):',
        `Rs. ${salaryData.totalEarnings.toLocaleString('en-IN')}`,
        'Total Deductions (B):',
        `Rs. ${salaryData.totalDeductions.toLocaleString('en-IN')}`
      ]
    ]
  });

  currentY = doc.lastAutoTable.finalY + 6;

  // Net Payable Card (Highlighted soft box, no harsh borders)
  doc.setFillColor(238, 242, 255); // Indigo-50
  doc.roundedRect(14, currentY, pageWidth - 28, 16, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('NET SALARY PAYABLE (A - B):', 20, currentY + 10.5);

  doc.setFontSize(15);
  doc.setTextColor(26, 35, 126);
  doc.text(
    `INR Rs. ${salaryData.netPayable.toLocaleString('en-IN')}`,
    pageWidth - 20,
    currentY + 10.5,
    { align: 'right' }
  );

  currentY += 24;

  // Rate Information
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Pay Rates: Daily Base Rate = Rs. ${salaryData.dailySalary} | Standard Hourly Rate = Rs. ${salaryData.hourlyRate}/hr. Standard Work Day = 8 Hours.`,
    14,
    currentY
  );

  currentY += 16;

  // Signatures & Notes
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text('____________________________________', 14, currentY + 12);
  doc.text('Employee Signature', 14, currentY + 17);

  doc.text('____________________________________', pageWidth - 14, currentY + 12, { align: 'right' });
  doc.text('Authorized HR Signatory', pageWidth - 14, currentY + 17, { align: 'right' });
  doc.text('MAAS Group Of Companies', pageWidth - 14, currentY + 21, { align: 'right' });

  // Footer Note
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This is a computer-generated salary statement issued by MAAS Group Of Companies HRMS. No physical signature required.',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  const filename = `MAAS_Payslip_${salaryData.staffName.replace(/\s+/g, '_')}_${salaryData.monthName}_${salaryData.year}.pdf`;
  return { doc, filename };
}

// Download PDF directly in browser
export function generateSalarySlipPdf(salaryData) {
  const { doc, filename } = buildSalarySlipPdfDoc(salaryData);
  doc.save(filename);
  return filename;
}

// Generate base64 PDF string for real email attachment
export function getSalarySlipPdfBase64(salaryData) {
  const { doc, filename } = buildSalarySlipPdfDoc(salaryData);
  const dataUri = doc.output('datauristring');
  const base64 = dataUri.split(',')[1] || '';
  return { filename, base64 };
}

