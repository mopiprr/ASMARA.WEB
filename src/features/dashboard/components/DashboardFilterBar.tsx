import { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  ChevronDown,
  RefreshCw,
  User,
  Users,
  X,
} from 'lucide-react';

import type { TicketTypeFilter } from '../types/dashboard.types';

const TABS: { value: TicketTypeFilter; label: string }[] = [
  { value: 'all', label: 'All Tickets' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'procurement', label: 'Procurement' },
];

type DatePresetKey = 'today' | 'last7' | 'last30' | 'thisMonth';

const DATE_PRESETS: { key: DatePresetKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'last7', label: 'The Last 7 Days' },
  { key: 'last30', label: 'The Last 30 Days' },
  { key: 'thisMonth', label: 'This Month' },
];

function toInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPresetRange(key: DatePresetKey): { start: string; end: string } {
  const now = new Date();
  const end = toInputDate(now);

  switch (key) {
    case 'today':
      return { start: end, end };
    case 'last7': {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      return { start: toInputDate(start), end };
    }
    case 'last30': {
      const start = new Date(now);
      start.setDate(now.getDate() - 29);
      return { start: toInputDate(start), end };
    }
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: toInputDate(start), end };
    }
  }
}

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
  const [openPresetMenu, setOpenPresetMenu] = useState(false);
  const presetRef = useRef<HTMLDivElement | null>(null);

  const hasDateFilter = Boolean(startDate || endDate);

  // Tutup dropdown preset saat klik di luar
  useEffect(() => {
    if (!openPresetMenu) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        presetRef.current &&
        !presetRef.current.contains(event.target as Node)
      ) {
        setOpenPresetMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openPresetMenu]);

  const handleApplyPreset = (key: DatePresetKey) => {
    const { start, end } = getPresetRange(key);
    onStartDateChange(start);
    onEndDateChange(end);
    setOpenPresetMenu(false);
  };

  const handleClearDate = () => {
    onStartDateChange('');
    onEndDateChange('');
    setOpenPresetMenu(false);
  };

  const getActivePresetLabel = () => {
    if (!hasDateFilter) return 'Quick Date Filter';

    for (const preset of DATE_PRESETS) {
      const range = getPresetRange(preset.key);
      if (range.start === startDate && range.end === endDate) {
        return preset.label;
      }
    }

    return 'Kustom';
  };

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 xl:flex-row xl:items-center xl:justify-between">
      {/* Underline Tabs */}
      <nav className="-mb-px flex shrink-0 items-center gap-6">
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

      {/* Right Controls: Scope Switcher, Inline Date Inputs, Quick Preset & Refresh */}
      <div className="flex flex-wrap items-center gap-2 pb-2.5 xl:ml-auto">
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

        {/* INLINE CUSTOM DATE RANGE (Langsung muncul tanpa perlu klik tombol) */}
        <div
          className={`flex flex-wrap items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs transition ${
            hasDateFilter
              ? 'border-blue-200 bg-blue-50/60'
              : 'border-slate-200 bg-white'
          }`}
        >
          <Calendar
            size={14}
            className={hasDateFilter ? 'text-blue-600' : 'text-slate-400'}
          />

          <label
            htmlFor="startDate"
            className="text-[11px] font-medium text-slate-500"
          >
            From
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="rounded-lg border border-slate-200/80 bg-slate-50/70 px-2 py-1 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
          />

          <span className="text-slate-300">–</span>

          <label
            htmlFor="endDate"
            className="text-[11px] font-medium text-slate-500"
          >
            To
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="rounded-lg border border-slate-200/80 bg-slate-50/70 px-2 py-1 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
          />

          {hasDateFilter && (
            <button
              type="button"
              onClick={handleClearDate}
              title="Reset tanggal"
              className="ml-0.5 rounded-lg p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* QUICK PRESET DROPDOWN */}
        <div ref={presetRef} className="relative">
          <button
            type="button"
            onClick={() => setOpenPresetMenu((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
              openPresetMenu ||
              (hasDateFilter && getActivePresetLabel() !== 'Kustom')
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
            title="Pilih rentang tanggal cepat"
          >
            <span>{getActivePresetLabel()}</span>
            <ChevronDown
              size={13}
              className={`transition-transform duration-150 ${
                openPresetMenu ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openPresetMenu && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-40 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_12px_28px_-6px_rgba(15,23,42,0.14)] ring-1 ring-slate-950/5">
              {DATE_PRESETS.map((preset) => {
                const range = getPresetRange(preset.key);
                const isSelected =
                  range.start === startDate && range.end === endDate;

                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => handleApplyPreset(preset.key)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition ${
                      isSelected
                        ? 'bg-blue-600 font-semibold text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{preset.label}</span>
                  </button>
                );
              })}

              {hasDateFilter && (
                <>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={handleClearDate}
                    className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    Semua Tanggal
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* REFRESH BUTTON */}
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
  );
}

export default DashboardFilterBar;