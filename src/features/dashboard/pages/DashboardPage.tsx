import {
  Boxes,
  ClipboardList,
  Wrench,
  Clock3,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Package,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
} from 'lucide-react';

const statistics = [
  {
    title: 'Total Assets',
    value: '1,284',
    change: '+12.5%',
    description: 'Compared to last month',
    icon: Boxes,
    positive: true,
    iconStyle: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Procurement Requests',
    value: '48',
    change: '+8.2%',
    description: 'Compared to last month',
    icon: ClipboardList,
    positive: true,
    iconStyle: 'bg-purple-100 text-purple-600',
  },
  {
    title: 'Maintenance Tickets',
    value: '23',
    change: '-4.3%',
    description: 'Compared to last month',
    icon: Wrench,
    positive: true,
    iconStyle: 'bg-orange-100 text-orange-600',
  },
  {
    title: 'Pending Approvals',
    value: '12',
    change: '+2',
    description: 'Waiting for your review',
    icon: Clock3,
    positive: false,
    iconStyle: 'bg-amber-100 text-amber-600',
  },
];

const requests = [
  {
    id: 'PR-2026-001',
    title: 'Laptop Dell Latitude 5450',
    department: 'Information Technology',
    date: '03 Nov 2026',
    status: 'Pending',
    statusStyle: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'PR-2026-002',
    title: 'Office Chair Ergonomic',
    department: 'Human Resources',
    date: '02 Nov 2026',
    status: 'Approved',
    statusStyle: 'bg-green-100 text-green-700',
  },
  {
    id: 'PR-2026-003',
    title: 'Printer HP LaserJet',
    department: 'Finance',
    date: '01 Nov 2026',
    status: 'In Progress',
    statusStyle: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'PR-2026-004',
    title: 'Projector Epson',
    department: 'Marketing',
    date: '31 Oct 2026',
    status: 'Rejected',
    statusStyle: 'bg-red-100 text-red-700',
  },
];

const activities = [
  {
    title: 'Procurement request submitted',
    description: 'PR-2026-001 · Laptop Dell Latitude 5450',
    time: '10 minutes ago',
    icon: ClipboardList,
    iconStyle: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Maintenance ticket completed',
    description: 'MT-2026-014 · Air Conditioner Repair',
    time: '1 hour ago',
    icon: CheckCircle2,
    iconStyle: 'bg-green-100 text-green-600',
  },
  {
    title: 'New asset registered',
    description: 'AST-2026-089 · Office Monitor',
    time: '3 hours ago',
    icon: Package,
    iconStyle: 'bg-purple-100 text-purple-600',
  },
  {
    title: 'Approval required',
    description: 'PR-2026-005 · Office Equipment',
    time: '5 hours ago',
    icon: AlertCircle,
    iconStyle: 'bg-amber-100 text-amber-600',
  },
];

function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Overview
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Welcome back! Here is what's happening in your organization.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm">
          <CalendarDays size={17} className="text-slate-400" />
          03 November 2026
        </div>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconStyle}`}
                >
                  <Icon size={23} />
                </div>

                <button
                  type="button"
                  aria-label={`More options for ${item.title}`}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                >
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                {item.title}
              </p>

              <div className="mt-2 flex items-end justify-between gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-800">
                  {item.value}
                </h2>

                <span
                  className={`mb-1 flex items-center gap-1 text-xs font-semibold ${
                    item.positive ? 'text-green-600' : 'text-amber-600'
                  }`}
                >
                  {item.positive ? (
                    <ArrowUpRight size={15} />
                  ) : (
                    <ArrowDownRight size={15} />
                  )}
                  {item.change}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                {item.description}
              </p>
            </div>
          );
        })}
      </section>

      {/* Middle Section */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Asset Overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Asset Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Asset distribution by category
              </p>
            </div>

            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              This Month
            </button>
          </div>

          <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row">
            {/* Donut Chart */}
            <div className="relative flex h-48 w-48 shrink-0 items-center justify-center rounded-full"
              style={{
                background:
                  'conic-gradient(#2563eb 0% 38%, #8b5cf6 38% 63%, #f59e0b 63% 82%, #10b981 82% 100%)',
              }}
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-3xl font-bold text-slate-800">
                  1,284
                </span>
                <span className="text-xs text-slate-400">
                  Total Assets
                </span>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="w-full space-y-5">
              {[
                { name: 'Electronics', count: 488, color: 'bg-blue-600', percent: '38%' },
                { name: 'Furniture', count: 321, color: 'bg-violet-500', percent: '25%' },
                { name: 'Vehicles', count: 244, color: 'bg-amber-500', percent: '19%' },
                { name: 'Others', count: 231, color: 'bg-emerald-500', percent: '18%' },
              ].map((category) => (
                <div key={category.name}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${category.color}`} />
                      <span className="text-slate-600">{category.name}</span>
                    </div>

                    <span className="font-semibold text-slate-800">
                      {category.count} ({category.percent})
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${category.color}`}
                      style={{ width: category.percent }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">
            Ticket Summary
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current ticket status
          </p>

          <div className="mt-7 space-y-6">
            {[
              { label: 'Open Tickets', value: 8, color: 'bg-blue-500', width: '35%' },
              { label: 'In Progress', value: 10, color: 'bg-amber-500', width: '43%' },
              { label: 'Completed', value: 5, color: 'bg-green-500', width: '22%' },
            ].map((ticket) => (
              <div key={ticket.label}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    {ticket.label}
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {ticket.value}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${ticket.color}`}
                    style={{ width: ticket.width }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-800">
              Keep things moving!
            </p>
            <p className="mt-1 text-xs leading-relaxed text-blue-600">
              There are 12 approvals waiting for review.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Section */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Requests */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Recent Procurement Requests
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest procurement activities
              </p>
            </div>

            <button
              type="button"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Request</th>
                  <th className="px-6 py-4 font-semibold">Department</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {requests.map((request) => (
                  <tr key={request.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">
                        {request.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {request.id}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {request.department}
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {request.date}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${request.statusStyle}`}>
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Recent Activities
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest system updates
              </p>
            </div>

            <button
              type="button"
              aria-label="More activities"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="mt-7 space-y-6">
            {activities.map((activity) => {
              const Icon = activity.icon;

              return (
                <div key={activity.title} className="flex gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${activity.iconStyle}`}>
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {activity.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {activity.description}
                    </p>
                    <p className="mt-2 text-[11px] text-slate-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;