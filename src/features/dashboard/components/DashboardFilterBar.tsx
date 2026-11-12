import { useState } from 'react';
import { Filter, RefreshCw, User, Users } from 'lucide-react';

import type { TicketTypeFilter } from '../types/dashboard.types';

const TABS: { value: TicketTypeFilter; label: string }[] = [
  { value: 'all', label: 'All Tickets' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'procurement', label: 'Procurement' },
];

interface DashboardFilterBarProps {
  ticketFilter: TicketTypeFilter;
  onTicketFilterChange: (value: TicketTypeFilter) => void;

  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;

  isRefreshing: boolean;
  onRefresh: () => void;

  hasSubordinates?: boolean;
  scope?: 'personal' | 'team';
  onScopeChange?: (scope: 'personal' | 'team') => void;
}

function DashboardFilterBar({
  ticketFilter,
  onTicketFilterChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  isRefreshing,
  onRefresh,
  hasSubordinates = false,
  scope = 'personal',
  onScopeChange,
}: DashboardFilterBarProps) {
  const [showDateFilter, setShowDateFilter] = useState(false);

  const hasDateFilter = Boolean(startDate || endDate);

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-slate-200 sm:flex-row sm:items-center sm:justify-between">
        {/* Underline Tabs */}
        <nav className="-mb-px flex items-center gap-6">
          {TABS.map((tab) => {
            const isActive = ticketFilter === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onTicketFilterChange(tab.value)}
                className={`relative pb-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Scope Switcher (Manager only), Date Filter & Refresh */}
        <div className="flex flex-wrap items-center gap-2 pb-2 sm:ml-auto">
          {hasSubordinates && (
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/90 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => onScopeChange?.('personal')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition ${
                  scope === 'personal'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilkan hanya tiket pribadi saya"
              >
                <User size={13} />
                <span>Pribadi</span>
              </button>
              <button
                type="button"
                onClick={() => onScopeChange?.('team')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition ${
                  scope === 'team'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilkan tiket seluruh tim / bawahan departemen"
              >
                <Users size={13} />
                <span>Tim / Bawahan</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowDateFilter(!showDateFilter)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
              showDateFilter || hasDateFilter
                ? 'border-blue-200 bg-blue-50 text-blue-600'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
            title="Filter by date"
          >
            <Filter size={14} />
            <span>
              {hasDateFilter
                ? `${startDate || '...'} s/d ${endDate || '...'}`
                : 'Date Filter'}
            </span>
            {hasDateFilter && (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            )}
          </button>

          {hasDateFilter && (
            <button
              type="button"
              onClick={() => {
                onStartDateChange('');
                onEndDateChange('');
              }}
              className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh dashboard data"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            title="Refresh all dashboard data"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? 'animate-spin text-blue-600' : ''}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Collapsible Date Filter Inputs */}
      {showDateFilter && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <label htmlFor="startDate" className="text-xs font-medium text-slate-500">
              Start:
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="endDate" className="text-xs font-medium text-slate-500">
              End:
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardFilterBar;