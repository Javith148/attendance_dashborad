import { getSmtpSettings, saveSmtpSettings } from './storage';
import { getSalarySlipPdfBase64 } from './pdfExport';

export function getSmtpConfig() {
  return {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    senderEmail: 'javithjavi148@gmail.com',
    senderName: 'MAAS Group Of Companies'
  };
}

export function updateSmtpConfig(newSettings) {
  saveSmtpSettings(newSettings);
}

// Generate the HTML payload for the salary slip email
export function generateSalaryEmailHtml(salaryData, smtpConfig) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 8px; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #1A237E; margin: 0; font-size: 22px; font-weight: 700;">MAAS GROUP OF COMPANIES</h2>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">HR & Accounts Department - Corporate Payroll Notification</p>
      </div>

      <div style="background: #f1f5f9; padding: 14px 18px; border-radius: 6px; margin-bottom: 20px;">
        <h3 style="margin: 0; font-size: 15px; color: #0f172a;">Official Salary Statement for ${salaryData.monthName} ${salaryData.year}</h3>
      </div>

      <p>Dear <strong>${salaryData.staffName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Your monthly salary for the pay period of <strong>${salaryData.monthName} ${salaryData.year}</strong> has been computed and credited in accordance with MAAS HR attendance policies.
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13.5px;">
        <tr style="background: #f8fafc;">
          <td style="padding: 9px 12px; font-weight: bold; color: #64748b;">Employee ID</td>
          <td style="padding: 9px 12px; color: #0f172a;">${salaryData.staffId}</td>
          <td style="padding: 9px 12px; font-weight: bold; color: #64748b;">Department</td>
          <td style="padding: 9px 12px; color: #0f172a;">${salaryData.department}</td>
        </tr>
        <tr>
          <td style="padding: 9px 12px; font-weight: bold; color: #64748b;">Total Hours Worked</td>
          <td style="padding: 9px 12px; color: #0f172a;">${salaryData.totalHours} hrs</td>
          <td style="padding: 9px 12px; font-weight: bold; color: #64748b;">Effective Paid Days</td>
          <td style="padding: 9px 12px; color: #0f172a;">${salaryData.effectiveDays} Days</td>
        </tr>
        <tr style="background: #f8fafc;">
          <td style="padding: 9px 12px; font-weight: bold; color: #64748b;">Full Days (>= 8h)</td>
          <td style="padding: 9px 12px; color: #0f172a;">${salaryData.fullDays}</td>
          <td style="padding: 9px 12px; font-weight: bold; color: #64748b;">Half Days (< 8h)</td>
          <td style="padding: 9px 12px; color: #0f172a;">${salaryData.halfDays}</td>
        </tr>
        <tr>
          <td style="padding: 9px 12px; font-weight: bold; color: #64748b;">Gross Earnings</td>
          <td style="padding: 9px 12px; color: #16a34a; font-weight: bold;">Rs. ${Number(salaryData.grossSalary || salaryData.totalEarnings).toLocaleString('en-IN')}</td>
          <td style="padding: 9px 12px; font-weight: bold; color: #64748b;">Total Deductions</td>
          <td style="padding: 9px 12px; color: #dc2626;">Rs. ${salaryData.totalDeductions.toLocaleString('en-IN')}</td>
        </tr>
        <tr style="background: #eef2ff;">
          <td colspan="2" style="padding: 12px; font-weight: bold; font-size: 15px; color: #1e293b;">Net Salary Payable</td>
          <td colspan="2" style="padding: 12px; font-weight: bold; font-size: 17px; color: #1A237E; text-align: right;">
            INR Rs. ${salaryData.netPayable.toLocaleString('en-IN')}
          </td>
        </tr>
      </table>

      <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
        Please find your confidential PDF Salary Slip attached to this email.<br/>
        For any payroll inquiries, please visit the Corporate HR Department.
      </p>

      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        Sent from javithjavi148@gmail.com via MAAS Corporate SMTP Dispatch | MAAS Group Of Companies
      </div>
    </div>
  `;
}

// Dispatches real email with PDF payslip attached via Gmail SMTP
export async function sendSalarySlipEmail(salaryData, smtpConfig) {
  // Generate real PDF base64 attachment
  let pdfData = null;
  try {
    pdfData = getSalarySlipPdfBase64(salaryData);
  } catch (err) {
    console.warn('Could not generate PDF base64:', err);
  }

  // Call backend email endpoint powered by nodemailer
  const response = await fetch('/api/send-payslip-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      toEmail: salaryData.email,
      staffName: salaryData.staffName,
      staffId: salaryData.staffId,
      monthName: salaryData.monthName,
      year: salaryData.year,
      grossSalary: salaryData.grossSalary,
      netPayable: salaryData.netPayable,
      pdfBase64: pdfData?.base64,
      pdfFileName: pdfData?.filename
    })
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to dispatch email via Gmail SMTP');
  }

  // Store in sent email audit trail
  const auditLogs = JSON.parse(localStorage.getItem('maas_sent_emails') || '[]');
  const newLog = {
    id: `MAIL-${Date.now().toString().slice(-4)}`,
    to: salaryData.email,
    staffName: salaryData.staffName,
    subject: `MAAS Group - Salary Payslip for ${salaryData.monthName} ${salaryData.year}`,
    timestamp: new Date().toISOString(),
    status: 'Delivered (Gmail SMTP)',
    smtpHost: 'smtp.gmail.com:465',
    senderEmail: 'javithjavi148@gmail.com',
    netPayable: salaryData.netPayable,
    pdfAttached: pdfData?.filename || 'Payslip.pdf'
  };
  auditLogs.unshift(newLog);
  localStorage.setItem('maas_sent_emails', JSON.stringify(auditLogs));

  return {
    success: true,
    message: `Salary Slip PDF emailed successfully to ${salaryData.email} from javithjavi148@gmail.com!`,
    audit: newLog,
    messageId: result.messageId
  };
}

export function getSentEmailLogs() {
  try {
    return JSON.parse(localStorage.getItem('maas_sent_emails') || '[]');
  } catch (e) {
    return [];
  }
}

