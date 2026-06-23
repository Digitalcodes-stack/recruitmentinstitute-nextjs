import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { ReactNode } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getFinanceSnapshot } from '@/lib/finance'
import { IndianRupee, ReceiptText, ShieldCheck, RefreshCw, WalletCards, ArrowRight } from 'lucide-react'

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

  const cards = [
    { label: 'Collected', value: `₹${snapshot.collected.toLocaleString('en-IN')}`, icon: WalletCards, tone: 'sky' },
    { label: 'Outstanding', value: `₹${snapshot.outstanding.toLocaleString('en-IN')}`, icon: IndianRupee, tone: 'amber' },
    { label: 'Invoices', value: String(snapshot.invoices), icon: ReceiptText, tone: 'emerald' },
    { label: 'Refunds', value: `₹${snapshot.refunded.toLocaleString('en-IN')}`, icon: RefreshCw, tone: 'rose' },
  ] as const

  return (
    <AdminLayout title="Finance Dashboard">
      <div className="mb-8 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6 px-6 py-7 xl:grid-cols-[1.25fr_0.75fr] xl:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Finance Control Center
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-950 md:text-4xl">Fees Management</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Track course fees, invoices, installment plans, payments, and refunds from one structured dashboard.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <HeroMetric label="Active accounts" value={String(snapshot.accounts)} />
            <HeroMetric label="Overdue accounts" value={String(snapshot.overdueAccounts)} tone="warn" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                tone === 'amber' ? 'bg-amber-50 text-amber-700' :
                tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                tone === 'rose' ? 'bg-rose-50 text-rose-700' :
                'bg-sky-50 text-sky-700'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
                <p className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <Panel title="Recent Invoices" actionHref="/admin/fees">
          <List items={recentInvoices.map((invoice) => ({
            title: invoice.invoiceNo,
            subtitle: `${invoice.feeAccount.student.name} · ${invoice.feeAccount.batch?.name ?? invoice.feeAccount.planName}`,
            meta: `${invoice.status} · ₹${Number(invoice.balanceAmount).toLocaleString('en-IN')} due`,
          }))} />
        </Panel>
        <Panel title="Recent Payments" actionHref="/admin/finance">
          <List items={recentPayments.map((payment) => ({
            title: `${payment.gateway} · ₹${Number(payment.amount).toLocaleString('en-IN')}`,
            subtitle: payment.feeAccount.student.name,
            meta: payment.status,
          }))} />
        </Panel>
        <Panel title="Recent Refunds" actionHref="/admin/finance">
          <List items={recentRefunds.map((refund) => ({
            title: `₹${Number(refund.amount).toLocaleString('en-IN')}`,
            subtitle: refund.feeAccount.student.name,
            meta: refund.status,
          }))} />
        </Panel>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <LinkCard title="Fees Catalog" desc="Manage base course pricing" href="/admin/fees" />
        <LinkCard title="Fee Accounts" desc="Create and monitor student ledgers" href="/api/admin/finance/accounts" external />
        <LinkCard title="Invoices" desc="Generate GST-ready invoices" href="/api/admin/finance/invoices" external />
        <LinkCard title="Payments" desc="Reconcile gateway collections" href="/api/admin/finance/payments" external />
      </div>
    </AdminLayout>
  )
}

function HeroMetric({ label, value, tone = 'ok' }: { label: string; value: string; tone?: 'ok' | 'warn' }) {
  return (
    <div className={`rounded-3xl border px-4 py-4 shadow-sm ${tone === 'warn' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-black tracking-[-0.04em] ${tone === 'warn' ? 'text-amber-700' : 'text-slate-950'}`}>{value}</p>
    </div>
  )
}

function Panel({ title, actionHref, children }: { title: string; actionHref: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] xl:col-span-1">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black tracking-[-0.03em] text-slate-950">{title}</h2>
        <Link href={actionHref} className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-800">
          View <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {children}
    </section>
  )
}

function List({ items }: { items: Array<{ title: string; subtitle: string; meta: string }> }) {
  return (
    <div className="space-y-3">
      {items.length ? items.map((item) => (
        <div key={`${item.title}-${item.subtitle}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm font-bold text-slate-950">{item.title}</p>
          <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{item.meta}</p>
        </div>
      )) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">Nothing here yet.</div>
      )}
    </div>
  )
}

function LinkCard({ title, desc, href, external }: { title: string; desc: string; href: string; external?: boolean }) {
  const content = (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_80px_rgba(15,23,42,0.1)]">
      <p className="text-sm font-black tracking-[-0.03em] text-slate-950">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{desc}</p>
    </div>
  )

  return external ? (
    <a href={href} target="_blank" rel="noreferrer">{content}</a>
  ) : (
    <Link href={href}>{content}</Link>
  )
}
