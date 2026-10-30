import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import nodemailer from 'nodemailer';

function payslipEmailPlugin() {
  return {
    name: 'payslip-email-plugin',
    configureServer(server) {
      server.middlewares.use('/api/send-payslip-email', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const {
              toEmail,
              staffName,
              staffId,
              monthName,
              year,
              grossSalary,
              netPayable,
              pdfBase64,
              pdfFileName
            } = JSON.parse(body);

            const transporter = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 465,
              secure: true,
              auth: {
                user: 'javithjavi148@gmail.com',
                pass: 'cetrcbnkplyhrjny'
              }
            });

            // Target recipient + copy to javithjavi148@gmail.com
            const recipients = [];
            if (toEmail && toEmail.includes('@') && !toEmail.endsWith('.local')) {
              recipients.push(toEmail);
            }
            if (!recipients.includes('javithjavi148@gmail.com')) {
              recipients.push('javithjavi148@gmail.com');
            }

            const mailOptions = {
              from: 'MAAS Group Of Companies <javithjavi148@gmail.com>',
              to: recipients.join(', '),
              subject: `Salary Payslip (${monthName} ${year}) - ${staffName} [${staffId}]`,
              html: `
                <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
                  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px;">
                      <h2 style="color: #1a237e; margin: 0 0 6px 0; font-size: 22px;">MAAS GROUP OF COMPANIES</h2>
                      <p style="margin: 0; color: #64748b; font-size: 13px;">Corporate HR & Payroll Administration</p>
                    </div>

                    <p style="font-size: 14px; margin-bottom: 16px;">Dear <strong>${staffName}</strong>,</p>
                    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                      Your official salary payslip for the pay period <strong>${monthName} ${year}</strong> has been computed and approved.
                    </p>

                    <div style="background-color: #f1f5f9; border-radius: 12px; padding: 18px; margin: 20px 0;">
                      <table style="width: 100%; font-size: 13px;">
                        <tr>
                          <td style="color: #64748b; padding: 4px 0;">Employee ID:</td>
                          <td style="font-weight: bold; color: #0f172a; text-align: right;">${staffId}</td>
                        </tr>
                        <tr>
                          <td style="color: #64748b; padding: 4px 0;">Gross Salary:</td>
                          <td style="font-weight: bold; color: #0f172a; text-align: right;">Rs. ${Number(grossSalary || 0).toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                          <td style="color: #64748b; padding: 4px 0;">Net Disbursed:</td>
                          <td style="font-weight: bold; color: #059669; font-size: 16px; text-align: right;">Rs. ${Number(netPayable || 0).toLocaleString('en-IN')}</td>
                        </tr>
                      </table>
                    </div>

                    <p style="font-size: 13px; color: #64748b;">
                      Please find your official confidential PDF Salary Slip attached to this email.
                    </p>

                    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
                      This is an automated communication sent from MAAS HRMS Portal.<br/>
                      Dispatched from: javithjavi148@gmail.com | MAAS Group of Companies &copy; ${new Date().getFullYear()}
                    </div>
                  </div>
                </div>
              `,
              attachments: pdfBase64 ? [
                {
                  filename: pdfFileName || `MAAS_Payslip_${staffName.replace(/\s+/g, '_')}_${monthName}_${year}.pdf`,
                  content: Buffer.from(pdfBase64, 'base64'),
                  contentType: 'application/pdf'
                }
              ] : []
            };

            const info = await transporter.sendMail(mailOptions);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              messageId: info.messageId,
              deliveredTo: recipients.join(', ')
            }));
          } catch (err) {
            console.error('SMTP Delivery Error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: err.message || 'SMTP delivery failed'
            }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), payslipEmailPlugin()],
  server: {
    port: 3000,
    open: false
  }
});
