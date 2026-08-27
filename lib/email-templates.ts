/**
 * Bulletproof, high-contrast email template system.
 * Designed to render flawlessly across Gmail (iOS/Android Light & Dark mode),
 * Apple Mail, Outlook, Yahoo, and Webmail clients.
 */

export interface EmailRow {
  label: string
  value: string | number | null | undefined
  isHighlight?: boolean
  isEmail?: boolean
  isPhone?: boolean
  isMonospace?: boolean
}

export interface BaseEmailOptions {
  badgeText: string
  badgeBg?: string
  badgeColor?: string
  badgeBorder?: string
  title: string
  subtitle?: string
  introText?: string
  rows: EmailRow[]
  actionButton?: {
    text: string
    url: string
    color?: string
  }
  secondaryButton?: {
    text: string
    url: string
  }
  footerNote?: string
}

export function renderExecutiveEmailHtml(opts: BaseEmailOptions): string {
  const badgeBg = opts.badgeBg || '#eff6ff'
  const badgeColor = opts.badgeColor || '#1d4ed8'
  const badgeBorder = opts.badgeBorder || '#bfdbfe'
  const btnColor = opts.actionButton?.color || '#2563eb'

  const formattedRows = opts.rows
    .filter((r) => r.value !== undefined && r.value !== null && r.value !== '')
    .map((r, idx, arr) => {
      const isLast = idx === arr.length - 1
      const borderStyle = isLast ? '' : 'border-bottom: 1px solid #e2e8f0;'
      
      let renderedValue = String(r.value)
      if (r.isEmail) {
        renderedValue = `<a href="mailto:${r.value}" style="color: #2563eb; text-decoration: none; font-weight: 700;">${r.value}</a>`
      } else if (r.isPhone) {
        renderedValue = `<a href="tel:${r.value}" style="color: #0f172a; text-decoration: none; font-weight: 700;">${r.value}</a>`
      } else if (r.isMonospace) {
        renderedValue = `<span style="font-family: SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; color: #334155; font-weight: 600;">${r.value}</span>`
      } else if (r.isHighlight) {
        renderedValue = `<span style="color: #059669; font-weight: 800; font-size: 15px;">${r.value}</span>`
      }

      return `
        <tr>
          <td style="padding: 13px 18px; font-size: 13px; font-weight: 600; color: #475569; width: 36%; vertical-align: top; ${borderStyle}">
            ${r.label}
          </td>
          <td style="padding: 13px 18px; font-size: 14px; font-weight: 600; color: #0f172a; vertical-align: top; ${borderStyle}">
            ${renderedValue}
          </td>
        </tr>
      `
    })
    .join('')

  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${opts.title}</title>
  <style>
    /* Global Resets */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    
    /* Dark mode enhancements */
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #0f172a !important; }
      .card-bg { background-color: #1e293b !important; border-color: #334155 !important; }
      .text-title { color: #f8fafc !important; }
      .text-sub { color: #94a3b8 !important; }
      .table-bg { background-color: #0f172a !important; border-color: #334155 !important; }
      .label-cell { color: #94a3b8 !important; }
      .value-cell { color: #f8fafc !important; }
      .footer-bg { background-color: #0f172a !important; border-color: #334155 !important; color: #64748b !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; width: 100% !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f1f5f9" class="email-bg" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" class="card-bg" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);">
          
          <!-- Top Brand Header Bar -->
          <tr>
            <td style="padding: 24px 32px 20px 32px; border-bottom: 1px solid #f1f5f9; border-top: 4px solid ${btnColor};">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 13px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: #0f172a; margin-bottom: 8px;">
                      Recruitment Institute <span style="font-size: 11px; font-weight: 500; color: #64748b; text-transform: none;">• Official Portal Alert</span>
                    </div>
                    <div>
                      <span style="display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; background-color: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder};">
                        ${opts.badgeText}
                      </span>
                    </div>
                    <h1 class="text-title" style="margin: 14px 0 6px 0; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.25;">
                      ${opts.title}
                    </h1>
                    ${opts.subtitle ? `<p class="text-sub" style="margin: 0; font-size: 13.5px; color: #64748b; line-height: 1.5;">${opts.subtitle}</p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Section -->
          <tr>
            <td style="padding: 24px 32px;">
              ${opts.introText ? `<p class="text-sub" style="margin: 0 0 18px 0; font-size: 14.5px; color: #334155; line-height: 1.6;">${opts.introText}</p>` : ''}
              
              <!-- Data Table -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f8fafc" class="table-bg" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
                ${formattedRows}
              </table>

              <!-- Action Buttons -->
              ${opts.actionButton ? `
              <div style="text-align: center; margin: 28px 0 12px 0;">
                <a href="${opts.actionButton.url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: ${btnColor}; color: #ffffff !important; text-decoration: none; padding: 13px 30px; border-radius: 8px; font-weight: 700; font-size: 14px; letter-spacing: 0.01em; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);">
                  ${opts.actionButton.text}
                </a>
              </div>
              ` : ''}

              ${opts.secondaryButton ? `
              <div style="text-align: center; margin-top: 10px;">
                <a href="${opts.secondaryButton.url}" style="font-size: 13px; color: #64748b; text-decoration: underline; font-weight: 600;">
                  ${opts.secondaryButton.text}
                </a>
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#f8fafc" class="footer-bg" style="background-color: #f8fafc; padding: 18px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6;">
              ${opts.footerNote ? `<p style="margin: 0 0 4px 0; color: #64748b; font-weight: 600;">${opts.footerNote}</p>` : ''}
              <div>Recruitment Institute • Pune Office: Maharashtra 411001 • Global Online Live Training</div>
              <div style="margin-top: 2px;">Helpline: <a href="tel:+917385204165" style="color: #64748b; text-decoration: none;">+91 7385204165</a> | <a href="mailto:support@recruitmentinstitute.in" style="color: #64748b; text-decoration: none;">support@recruitmentinstitute.in</a></div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
