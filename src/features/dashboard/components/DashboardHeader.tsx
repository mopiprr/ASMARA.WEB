import { CalendarDays } from 'lucide-react';

import { formatToday } from '../utils/dashboard.utils';

interface DashboardHeaderProps {
  fullName: string;
}

function DashboardHeader({ fullName }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <p className="text-sm font-medium text-blue-600">
          Overview
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          Ticket Dashboard
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Welcome back, {fullName}! Here's your ticket activity overview.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm">
        <CalendarDays size={17} className="text-slate-400" />
        {formatToday()}
      </div>
    </div>
  );
}

export default DashboardHeader;