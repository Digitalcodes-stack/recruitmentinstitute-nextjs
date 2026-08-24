import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getFinanceSnapshot } from '@/lib/finance'
import {
  IndianRupee, ReceiptText, RefreshCw, WalletCards, ArrowUpRight,
  AlertTriangle, Users2, FileSpreadsheet, CreditCard, Wallet,
} from 'lucide-react'

/* ── Design tokens (mirrors AdminDashboard) ─────────────────── */

const C = {
  white:      '#ffffff',
  border:     '#e6eaf0',
  borderSoft: '#f0f3f7',
  text:       '#0f172a',
  textMid:    '#475569',
  textSoft:   '#94a3b8',
  shadow:     '0 1px 4px rgba(15,23,42,0.07)',
  radius:     16,
  radiusSm:   10,
}

function fmt(n: number) {
  return n.toLocaleString('en-IN')
}

function rupee(n: number) {
  return `₹${fmt(n)}`
}

function PanelHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      padding: '22px 28px 20px',
      borderBottom: `1px solid ${C.borderSoft}`,
    }}>
      <div>
        <p style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{title}</p>
        {sub && <p style={{ fontSize: 12, color: C.textSoft, marginTop: 3 }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}

function ViewAllBtn({ href }: { href: string }) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: 5,
      fontSize: 12, fontWeight: 600, color: '#2563eb',
      textDecoration: 'none', padding: '6px 12px',
      borderRadius: 8, whiteSpace: 'nowrap',
    }}>
      View all <ArrowUpRight size={12} />
    </Link>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: C.white, borderRadius: C.radius,
      border: `1px solid ${C.border}`, boxShadow: C.shadow,
    }}>
      {children}
    </div>
  )
}

function Empty({ msg }: { msg: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '48px 24px', textAlign: 'center',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14, background: '#f8fafc',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, marginBottom: 12,
      }}>📭</div>
      <p style={{ fontSize: 13, color: C.textSoft, fontWeight: 500 }}>{msg}</p>
    </div>
  )
}

const TH_STYLE: React.CSSProperties = {
  padding: '14px 24px',
  fontSize: 10, fontWeight: 700,
  letterSpacing: '0.16em', textTransform: 'uppercase',
  color: C.textSoft,
  background: '#f8fafc',
  borderBottom: `1px solid ${C.borderSoft}`,
  textAlign: 'left',
}
const TD_STYLE: React.CSSProperties = {
  padding: '18px 24px',
  fontSize: 13, color: C.textMid,
  borderBottom: `1px solid ${C.borderSoft}`,
  verticalAlign: 'middle',
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    PAID:      { bg: '#f0fdf4', color: '#15803d' },
    CAPTURED:  { bg: '#f0fdf4', color: '#15803d' },
    PROCESSED: { bg: '#f0fdf4', color: '#15803d' },
    ISSUED:    { bg: '#eff6ff', color: '#2563eb' },
    PENDING:   { bg: '#fffbeb', color: '#b45309' },
    OVERDUE:   { bg: '#fef2f2', color: '#dc2626' },
    FAILED:    { bg: '#fef2f2', color: '#dc2626' },
  }
  const tone = map[status] ?? { bg: '#f8fafc', color: C.textSoft }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: tone.bg, color: tone.color,
      borderRadius: 20, padding: '5px 12px',
      fontSize: 11, fontWeight: 700,
    }}>
      {status}
    </span>
  )
}

export default async function AdminFinancePage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const [snapshot, recentInvoices, recentPayments, recentRefunds] = await Promise.all([
    getFinanceSnapshot(),
    prisma.feeInvoice.findMany({
      include: { feeAccount: { include: { student: { select: { name: true, email: true } }, batch: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.feePayment.findMany({
      include: { feeAccount: { include: { student: { select: { name: true, email: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.feeRefund.findMany({
      include: { feeAccount: { include: { student: { select: { name: true, email: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const statCards = [
    { label: 'Collected',         value: rupee(snapshot.collected),   sub: `${snapshot.payments} payments`,        icon: WalletCards,     bg: '#f0fdf4', color: '#16a34a' },
    { label: 'Outstanding',       value: rupee(snapshot.outstanding), sub: `${snapshot.accounts} active accounts`, icon: IndianRupee,      bg: '#fffbeb', color: '#b45309' },
    { label: 'Invoices',          value: fmt(snapshot.invoices),      sub: 'Generated to date',                    icon: ReceiptText,      bg: '#eff6ff', color: '#2563eb' },
    { label: 'Refunds',           value: rupee(snapshot.refunded),    sub: `${snapshot.refunds} processed`,        icon: RefreshCw,        bg: '#fef2f2', color: '#dc2626' },
    { label: 'Active Accounts',   value: fmt(snapshot.accounts),      sub: 'Student fee ledgers',                  icon: Users2,           bg: '#faf5ff', color: '#7c3aed' },
    { label: 'Overdue Accounts',  value: fmt(snapshot.overdueAccounts), sub: 'Needs follow-up',                    icon: AlertTriangle,    bg: '#fff7ed', color: '#ea580c' },
  ]

  const quickLinks = [
    { label: 'Fees Catalog', desc: 'Manage base course pricing', href: '/admin/fees', icon: FileSpreadsheet, bg: '#eff6ff', color: '#2563eb', external: false },
    { label: 'Fee Accounts', desc: 'Create and monitor student ledgers', href: '/api/admin/finance/accounts', icon: Wallet, bg: '#f0fdf4', color: '#16a34a', external: true },
    { label: 'Invoices', desc: 'Generate GST-ready invoices', href: '/api/admin/finance/invoices', icon: ReceiptText, bg: '#faf5ff', color: '#7c3aed', external: true },
    { label: 'Payments', desc: 'Reconcile gateway collections', href: '/api/admin/finance/payments', icon: CreditCard, bg: '#fffbeb', color: '#b45309', external: true },
  ]

  return (
    <AdminLayout title="Finance Dashboard">
      <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── Hero ─────────────────────────────────────── */}
        <div style={{
          borderRadius: 20,
          background: 'linear-gradient(130deg,#0c1a2e 0%,#13305c 50%,#1a4fac 100%)',
          boxShadow: '0 20px 56px rgba(15,23,42,0.22)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', right: -60, top: -60,
            width: 280, height: 280, borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(96,165,250,0.18),transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'relative',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center',
            justifyContent: 'space-between', gap: 32,
            padding: '44px 52px',
          }}>
            <div>
              <span style={{
                display: 'inline-block',
                background: 'rgba(96,165,250,0.14)',
                border: '1px solid rgba(96,165,250,0.22)',
                borderRadius: 24, padding: '4px 14px',
                fontSize: 10, fontWeight: 800,
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: '#93c5fd',
              }}>
                Finance Control Center
              </span>
              <h1 style={{
                marginTop: 16,
                fontSize: 38, fontWeight: 900,
                lineHeight: 1.1, letterSpacing: '-0.02em',
                color: '#ffffff',
              }}>
                Fees Management
              </h1>
              <p style={{
                marginTop: 12, maxWidth: 520,
                fontSize: 14, lineHeight: 1.8, color: '#94b8d8',
              }}>
                Track course fees, invoices, installment plans, payments, and refunds from one structured dashboard.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: snapshot.overdueAccounts > 0 ? 'rgba(248,113,113,0.13)' : 'rgba(34,197,94,0.13)',
                border: `1px solid ${snapshot.overdueAccounts > 0 ? 'rgba(248,113,113,0.25)' : 'rgba(34,197,94,0.25)'}`,
                borderRadius: 24, padding: '8px 18px',
              }}>
                <AlertTriangle size={13} color={snapshot.overdueAccounts > 0 ? '#fca5a5' : '#4ade80'} />
                <span style={{ fontSize: 12, fontWeight: 600, color: snapshot.overdueAccounts > 0 ? '#fecaca' : '#86efac' }}>
                  {snapshot.overdueAccounts > 0 ? `${snapshot.overdueAccounts} overdue account${snapshot.overdueAccounts > 1 ? 's' : ''}` : 'All accounts current'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#5a7a99' }}>{today}</p>
            </div>
          </div>
        </div>

        {/* ── Stats grid ───────────────────────────────── */}
        <div>
          <p style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: C.textSoft, marginBottom: 20,
          }}>
            At a glance
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 18,
          }}>
            {statCards.map((s) => (
              <div key={s.label} style={{
                height: '100%', borderRadius: C.radius,
                background: C.white, border: `1px solid ${C.border}`,
                boxShadow: C.shadow, padding: '26px 24px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textSoft }}>
                    {s.label}
                  </p>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <s.icon size={18} color={s.color} />
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize: 34, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em', color: C.text }}>
                    {s.value}
                  </p>
                  <p style={{ fontSize: 12, color: C.textSoft, marginTop: 8 }}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent Invoices + Payments ───────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <Card>
            <PanelHeader title="Recent Invoices" sub="Latest billing activity" action={<ViewAllBtn href="/admin/fees" />} />
            {!recentInvoices.length ? <Empty msg="No invoices yet." /> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Invoice', 'Student', 'Status', 'Balance'].map(h => <th key={h} style={TH_STYLE}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td style={TD_STYLE}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{invoice.invoiceNo}</p>
                        <p style={{ fontSize: 11, color: C.textSoft, marginTop: 3 }}>
                          {invoice.feeAccount.batch?.name ?? invoice.feeAccount.planName}
                        </p>
                      </td>
                      <td style={TD_STYLE}>{invoice.feeAccount.student.name}</td>
                      <td style={TD_STYLE}><StatusPill status={invoice.status} /></td>
                      <td style={{ ...TD_STYLE, fontWeight: 700, color: C.text }}>
                        {rupee(Number(invoice.balanceAmount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <Card>
            <PanelHeader title="Recent Payments" sub="Latest gateway collections" action={<ViewAllBtn href="/admin/finance" />} />
            {!recentPayments.length ? <Empty msg="No payments yet." /> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Gateway', 'Student', 'Status', 'Amount'].map(h => <th key={h} style={TH_STYLE}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td style={{ ...TD_STYLE, fontWeight: 600, color: C.text }}>{payment.gateway}</td>
                      <td style={TD_STYLE}>{payment.feeAccount.student.name}</td>
                      <td style={TD_STYLE}><StatusPill status={payment.status} /></td>
                      <td style={{ ...TD_STYLE, fontWeight: 700, color: C.text }}>
                        {rupee(Number(payment.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        {/* ── Recent Refunds ───────────────────────────── */}
        <Card>
          <PanelHeader title="Recent Refunds" sub="Latest refund activity" action={<ViewAllBtn href="/admin/finance" />} />
          {!recentRefunds.length ? <Empty msg="No refunds yet." /> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Student', 'Status', 'Amount'].map(h => <th key={h} style={TH_STYLE}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {recentRefunds.map((refund) => (
                  <tr key={refund.id}>
                    <td style={{ ...TD_STYLE, fontWeight: 600, color: C.text }}>{refund.feeAccount.student.name}</td>
                    <td style={TD_STYLE}><StatusPill status={refund.status} /></td>
                    <td style={{ ...TD_STYLE, fontWeight: 700, color: C.text }}>
                      {rupee(Number(refund.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* ── Quick navigation ──────────────────────────── */}
        <Card>
          <PanelHeader title="Quick Navigation" sub="Jump directly to any finance tool" />
          <div style={{
            padding: '20px 24px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 12,
          }}>
            {quickLinks.map((item) => {
              const inner = (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px', borderRadius: C.radiusSm,
                  border: `1px solid ${C.borderSoft}`, background: '#fafbfd',
                  height: '100%',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: item.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <item.icon size={16} color={item.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.label}</p>
                    <p style={{ fontSize: 11, color: C.textSoft, marginTop: 2 }}>{item.desc}</p>
                  </div>
                  <ArrowUpRight size={13} color="#cbd5e1" />
                </div>
              )
              return item.external ? (
                <a key={item.href} href={item.href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>{inner}</a>
              ) : (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>{inner}</Link>
              )
            })}
          </div>
        </Card>

      </div>
    </AdminLayout>
  )
}
