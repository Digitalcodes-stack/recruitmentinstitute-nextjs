const nodemailer = require('nodemailer');

async function main() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'recruitmentinstitute5@gmail.com',
      pass: 'ledemkmjiesdqfpk'
    }
  });

  const info = await transporter.sendMail({
    from: '"Recruitment Institute" <recruitmentinstitute5@gmail.com>',
    to: 'sesasiba.es@gmail.com',
    cc: 'patilrupalib@gmail.com',
    subject: '📞 Urgent Lead: Immediate Call Requested by Rupali Patil (+919876543210)',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8fafc; border-radius: 12px;">
        <h2 style="color: #4f46e5;">📞 New Immediate Call Request Received</h2>
        <p>A candidate has requested a call on the website:</p>
        <ul>
          <li><strong>Candidate Name:</strong> Rupali Patil</li>
          <li><strong>Mobile Number:</strong> +91 98765 43210</li>
          <li><strong>Interested Program:</strong> HR & Recruitment Training</li>
          <li><strong>Assigned Counselor:</strong> Priya Sharma</li>
          <li><strong>Timestamp:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</li>
        </ul>
        <p><a href="tel:+919876543210" style="display:inline-block;padding:10px 20px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Call Candidate</a></p>
      </div>
    `
  });

  console.log('✅ Call lead email sent successfully! Message ID:', info.messageId);
}

main().catch(console.error);
