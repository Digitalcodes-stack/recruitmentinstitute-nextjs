const nodemailer = require('nodemailer');

async function testSMTP() {
  const configs = [
    { host: 'serenity.herosite.pro', port: 465, secure: true },
    { host: 'serenity.herosite.pro', port: 587, secure: false },
    { host: 'mail.recruitmentinstitute.in', port: 465, secure: true },
    { host: 'mail.recruitmentinstitute.in', port: 587, secure: false },
  ];

  for (const c of configs) {
    console.log(`Testing host: ${c.host}, port: ${c.port}, secure: ${c.secure}...`);
    const transporter = nodemailer.createTransport({
      host: c.host,
      port: c.port,
      secure: c.secure,
      auth: {
        user: 'support@recruitmentinstitute.in',
        pass: 'support@recruitmentinstitute',
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    try {
      await transporter.verify();
      console.log(`>>> SUCCESS: SMTP Verified for ${c.host}:${c.port}!`);
      
      const info = await transporter.sendMail({
        from: '"Recruitment Institute" <support@recruitmentinstitute.in>',
        to: 'support@recruitmentinstitute.in',
        cc: 'sesasiba.es@gmail.com',
        subject: 'Recruitment Institute - Live Email Delivery Confirmation',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">Email Delivery Is Working Successfully!</h2>
            <p>This is a confirmation test email sent from the Recruitment Institute platform.</p>
            <p><strong>Status:</strong> Active & Connected to cPanel Webmail</p>
            <p><strong>Mail Server:</strong> ${c.host}:${c.port}</p>
            <p><strong>Account:</strong> support@recruitmentinstitute.in</p>
          </div>
        `
      });
      console.log(`>>> EMAIL SENT SUCCESSFULLY! Message ID: ${info.messageId}`);
      return;
    } catch (err) {
      console.log(`Failed for ${c.host}:${c.port}: ${err.message}`);
    }
  }
}

testSMTP();
