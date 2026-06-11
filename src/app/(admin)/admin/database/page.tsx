import Link from 'next/link'
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import AdminLayout from '@/components/admin/AdminLayout'
import { Database, Table2, Rows3, Search, Filter, ShieldCheck, Hash } from 'lucide-react'

const ALLOWED_TABLES = [
  'about_us', 'answers', 'audit_logs', 'blog', 'candidate_login',
  'course_category', 'course_leads', 'courses', 'expert', 'faq',
  'faq_category', 'fees', 'fees_leads', 'knowledge_items', 'login_membership',
  'login_student', 'news', 'password_reset_tokens', 'questions', 'registers',
  'reviews', 'services', 'study_with_us', 'subscribe_email', 'tbl_contactus',
  'testimonials', 'user_admin',
] as const

type TableName = (typeof ALLOWED_TABLES)[number]

function getTableName(value: string | string[] | undefined): TableName {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw && (ALLOWED_TABLES as readonly string[]).includes(raw)) return raw as TableName
  return 'user_admin'
}

function getLimit(value: string | string[] | undefined) {
  const raw    = Array.isArray(value) ? value[0] : value
  const parsed = Number(raw || 20)
  if (Number.isFinite(parsed) && parsed > 0 && parsed <= 100) return Math.floor(parsed)
  return 20
}

async function getColumns(table: string) {
  return prisma.$queryRawUnsafe<Array<{ column_name: string; data_type: string; is_nullable: string }>>(
    `select column_name, data_type, is_nullable from information_schema.columns
     where table_schema = 'public' and table_name = '${table}' order by ordinal_position`
  )
}

async function getRows(table: string, limit: number) {
  return prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    `select * from "${table}" order by 1 desc limit ${limit}`
  )
}

async function getCount(table: string) {
  const result = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `select count(*)::bigint as count from "${table}"`
  )
  return Number(result[0]?.count || 0)
}

export default async function DatabaseViewerPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string | string[]; limit?: string | string[] }>
}) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const sp    = await searchParams
  const table = getTableName(sp.table)
  const limit = getLimit(sp.limit)

  const [tables, columns, rows, total] = await Promise.all([
    Promise.all(ALLOWED_TABLES.map(async (name) => ({ name, count: await getCount(name) }))),
    getColumns(table),
    getRows(table, limit),
    getCount(table),
  ])

  return (
    <AdminLayout title="Database Viewer">
      {/* Hero banner */}
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="rounded-2xl bg-[#0a1628] p-6 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] border border-white/[0.1] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200 mb-4">
            <ShieldCheck className="w-3 h-3" />
            Local PostgreSQL Browser
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mb-2">Database Viewer</h2>
          <p className="text-[13px] leading-relaxed text-slate-400 max-w-xl">
            Inspect approved local PostgreSQL tables, browse row data, and review schema structure without leaving the admin panel.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-slate-300">{total} rows in selected table</span>
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-slate-300">{columns.length} columns</span>
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-slate-300">Allow-list only</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Current Table</p>
              <p className="text-[13px] font-bold text-slate-900 mt-0.5 font-mono">{table}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
              <Table2 className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Preview Limit</p>
              <p className="text-[13px] font-bold text-slate-900 mt-0.5">{limit} rows</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout: table list + data */}
      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sidebar: table list */}
        <aside className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm self-start">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[14px] font-bold text-slate-900">Tables</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Allow-listed only</p>
            </div>
            <Filter className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 mb-3 text-[12px] text-slate-400">
            <Search className="w-3.5 h-3.5" />
            Search tables
          </div>
          <div className="space-y-0.5 max-h-[500px] overflow-y-auto">
            {tables.map((item) => {
              const active = item.name === table
              return (
                <Link
                  key={item.name}
                  href={`/admin/database?table=${item.name}&limit=${limit}`}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors text-[12px] ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Rows3 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate font-mono">{item.name}</span>
                  </span>
                  <span className={`text-[10px] font-bold shrink-0 ml-2 ${active ? 'text-blue-500' : 'text-slate-400'}`}>
                    {item.count}
                  </span>
                </Link>
              )
            })}
          </div>
        </aside>

        {/* Content: data table + schema */}
        <section className="space-y-5 min-w-0">
          {/* Data table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[14px] font-bold text-slate-900 font-mono">{table}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{total} total rows · showing first {Math.min(limit, rows.length)}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600">
                <ShieldCheck className="w-3 h-3" />
                Admin only
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {columns.map((col) => (
                      <th key={col.column_name} className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 whitespace-nowrap">
                        {col.column_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={Math.max(columns.length, 1)} className="px-4 py-12 text-center text-[13px] text-slate-400">
                        No rows found in this table.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        {columns.map((col) => (
                          <td key={col.column_name} className="px-4 py-3.5 align-top max-w-[280px]">
                            <div className="break-words text-[12px] leading-relaxed text-slate-700">
                              {renderValue(row[col.column_name])}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Schema + Tips */}
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-4 h-4 text-slate-400" />
                <h4 className="text-[14px] font-bold text-slate-900">Schema</h4>
              </div>
              <div className="space-y-2">
                {columns.map((col) => (
                  <div key={col.column_name} className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5">
                    <div>
                      <span className="text-[12px] font-semibold text-slate-900 font-mono">{col.column_name}</span>
                      <span className="ml-2 text-[11px] text-slate-400">{col.is_nullable === 'YES' ? 'nullable' : 'required'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 rounded-lg px-2 py-0.5">{col.data_type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-4 h-4 text-slate-400" />
                <h4 className="text-[14px] font-bold text-slate-900">Usage Tips</h4>
              </div>
              <div className="space-y-3">
                {[
                  'Use the table list on the left to switch between approved public tables.',
                  'Preview limit is capped at 100 rows for fast local inspection.',
                  'Only allow-listed tables are exposed to keep the UI safe.',
                  'For larger exports, CSV download and search can be added on request.',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                    <span className="w-5 h-5 rounded-lg bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-[12px] leading-relaxed text-slate-600">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

function renderValue(value: unknown): ReactNode {
  if (value === null || value === undefined) return <span className="text-slate-300">—</span>
  if (typeof value === 'boolean') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
        value ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200'
      }`}>
        <span className={`w-1 h-1 rounded-full ${value ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        {value ? 'True' : 'False'}
      </span>
    )
  }
  if (typeof value === 'object') {
    return <pre className="whitespace-pre-wrap text-[11px] text-slate-500 font-mono">{JSON.stringify(value, null, 2)}</pre>
  }
  return String(value)
}
