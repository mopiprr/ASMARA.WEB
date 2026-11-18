import {
  Search,
  AlertCircle,
  Boxes,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  UserPlus,
  X,
} from 'lucide-react';

import type { AssetListItem, AssetSortField } from '../types/asset.types';
import { ASSET_STATUSES, canAssignAsset } from '../utils/asset.utils';
import AssetStatusBadge from './AssetStatusBadge';
import AssetHolder from './AssetHolder';

// ==========================================
// PROPS
// ==========================================

interface AssetTableProps {
  assets: AssetListItem[];
  isLoading: boolean;
  error: string;
  onRefresh: () => void;
  onAssign: (asset: AssetListItem) => void;

  searchInput: string;
  onSearchChange: (value: string) => void;
  hasFilter: boolean;

  status: string;
  onStatusChange: (value: string) => void;

  sortBy: AssetSortField;
  desc: boolean;
  onSort: (field: AssetSortField) => void;

  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

// ==========================================
// SORTABLE HEADER
// ==========================================

interface SortableHeaderProps {
  label: string;
  field: AssetSortField;
  sortBy: AssetSortField;
  desc: boolean;
  onSort: (field: AssetSortField) => void;
}

function SortableHeader({
  label,
  field,
  sortBy,
  desc,
  onSort,
}: SortableHeaderProps) {
  const isActive = sortBy === field;
  const Icon = !isActive ? ArrowUpDown : desc ? ArrowDown : ArrowUp;

  return (
    <th className="px-5 py-3.5 font-semibold">
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider transition-colors hover:text-slate-700 ${
          isActive ? 'text-blue-700' : 'text-slate-400'
        }`}
      >
        {label}
        <Icon size={12} className={isActive ? 'text-blue-600' : 'opacity-50'} />
      </button>
    </th>
  );
}

// ==========================================
// COMPONENT
// ==========================================

function AssetTable({
  assets,
  isLoading,
  error,
  onRefresh,
  onAssign,
  searchInput,
  onSearchChange,
  hasFilter,
  status,
  onStatusChange,
  sortBy,
  desc,
  onSort,
  page,
  totalPages,
  totalCount,
  onPageChange,
}: AssetTableProps) {
  const sortProps = { sortBy, desc, onSort };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      {/* TABLE HEADER & TOOLBAR */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Boxes size={18} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Asset Registry
              </h2>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {totalCount.toLocaleString('en-US')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Daftar inventaris aset tetap dan pemegang saat ini
            </p>
          </div>
        </div>

        {/* FILTER CONTROLS */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* SEARCH */}
          <div className="relative w-full sm:w-64 lg:w-72">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchInput}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search tag, item, holder..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-8 text-xs text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* STATUS FILTER */}
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Status</option>
            {Object.entries(ASSET_STATUSES).map(([value, item]) => (
              <option key={value} value={value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <SortableHeader label="Asset Tag" field="assetTag" {...sortProps} />
              <SortableHeader label="Item" field="itemName" {...sortProps} />
              <SortableHeader label="Category" field="category" {...sortProps} />
              <SortableHeader label="Holder" field="holder" {...sortProps} />
              <SortableHeader label="Status" field="status" {...sortProps} />
              <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading && assets.length === 0 ? (
              /* SKELETON LOADING */
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-3.5">
                    <div className="h-5 w-24 rounded-md bg-slate-200" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-4 w-40 rounded bg-slate-200" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-4 w-24 rounded bg-slate-200" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-4 w-32 rounded bg-slate-200" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-5 w-20 rounded-full bg-slate-200" />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="ml-auto h-7 w-20 rounded-lg bg-slate-200" />
                  </td>
                </tr>
              ))
            ) : error ? (
              /* ERROR */
              <tr>
                <td colSpan={6} className="px-6 py-14 text-center">
                  <AlertCircle size={28} className="mx-auto text-rose-400" />
                  <p className="mt-2.5 text-sm font-semibold text-rose-600">
                    Failed to load assets
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{error}</p>
                  <button
                    type="button"
                    onClick={onRefresh}
                    className="mt-4 rounded-xl bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
                  >
                    Try Again
                  </button>
                </td>
              </tr>
            ) : assets.length === 0 ? (
              /* EMPTY */
              <tr>
                <td colSpan={6} className="px-6 py-14 text-center">
                  <Boxes size={36} className="mx-auto text-slate-300" />
                  <h3 className="mt-3 text-sm font-semibold text-slate-700">
                    {hasFilter ? 'No matching assets found' : 'No assets yet'}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {hasFilter
                      ? 'Try changing the search keyword or status filter.'
                      : 'Registered assets will appear here.'}
                  </p>
                </td>
              </tr>
            ) : (
              /* ROWS */
              assets.map((asset) => {
                const assignable = canAssignAsset(asset.status);

                return (
                  <tr
                    key={asset.id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span className="inline-flex items-center rounded-md border border-slate-200/80 bg-slate-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-800">
                        {asset.assetTag}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {asset.itemName}
                    </td>

                    <td className="px-5 py-3.5 text-slate-500">
                      {asset.categoryName}
                    </td>

                    <td className="px-5 py-3.5">
                      <AssetHolder asset={asset} />
                    </td>

                    <td className="px-5 py-3.5">
                      <AssetStatusBadge status={asset.status} />
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onAssign(asset)}
                        disabled={!assignable}
                        title={
                          assignable
                            ? 'Assign to employee'
                            : 'Only Available or In Use assets can be assigned'
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-2xs transition-colors hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
                      >
                        <UserPlus size={13} />
                        <span>Assign</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER + PAGING */}
      <div className="flex flex-col justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:px-6">
        <span>
          Showing <strong className="text-slate-700">{assets.length}</strong> of{' '}
          <strong className="text-slate-700">{totalCount}</strong> assets
        </span>

        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={15} />
          </button>

          <span className="px-2 font-semibold text-slate-700">
            {page} / {Math.max(totalPages, 1)}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default AssetTable;