import {
  Search,
  RefreshCw,
  AlertCircle,
  Boxes,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  RotateCcw,
  Filter,
} from 'lucide-react';

import type { AssetListItem, AssetSortField } from '../types/asset.types';
import { ASSET_STATUSES } from '../utils/asset.utils';
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
// COMPONENT
// ==========================================

function AssetTable({
  assets,
  isLoading,
  error,
  onRefresh,
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
  const renderSortIcon = (field: AssetSortField) => {
    if (sortBy !== field) {
      return (
        <ArrowUpDown
          size={13}
          className="text-slate-300 transition group-hover:text-slate-500"
        />
      );
    }
    return desc ? (
      <ArrowDown size={13} className="text-blue-600" />
    ) : (
      <ArrowUp size={13} className="text-blue-600" />
    );
  };

  const handleResetFilters = () => {
    onSearchChange('');
    onStatusChange('');
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* FILTER & CONTROLS HEADER */}
      <div className="border-b border-slate-100 p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Asset Inventory
              </h2>
              <p className="text-xs text-slate-500">
                Manage registered physical assets, assignments, and statuses.
              </p>
            </div>

            {hasFilter && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <RotateCcw size={13} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* FILTER CONTROLS BAR: Search is largest (flex-1), Status is smaller */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* SEARCH INPUT */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search asset tag, item name, or holder..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* STATUS SELECT */}
            <div className="relative w-full sm:w-52 lg:w-56">
              <Filter
                size={14}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={status}
                onChange={(event) => onStatusChange(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-9 pr-8 text-xs font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer truncate"
              >
                <option value="" className="font-bold">All Statuses</option>
                {Object.entries(ASSET_STATUSES).map(([value, item]) => (
                  <option key={value} value={value} className="font-semibold">
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* REFRESH */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={isLoading ? 'animate-spin text-blue-600' : 'text-slate-500'}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="m-5 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-lg bg-rose-600 px-3 py-1 font-semibold text-white transition hover:bg-rose-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50 font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              {/* ASSET TAG */}
              <th
                onClick={() => onSort('assetTag')}
                className="group cursor-pointer select-none px-6 py-3.5 transition hover:bg-slate-100/70"
                title="Click to sort by Asset Tag"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortBy === 'assetTag' ? 'font-bold text-blue-600' : ''}>
                    Asset Tag
                  </span>
                  {renderSortIcon('assetTag')}
                </div>
              </th>

              {/* ITEM NAME */}
              <th
                onClick={() => onSort('itemName')}
                className="group cursor-pointer select-none px-6 py-3.5 transition hover:bg-slate-100/70"
                title="Click to sort by Item Name"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortBy === 'itemName' ? 'font-bold text-blue-600' : ''}>
                    Item
                  </span>
                  {renderSortIcon('itemName')}
                </div>
              </th>

              {/* CATEGORY */}
              <th
                onClick={() => onSort('category')}
                className="group cursor-pointer select-none px-6 py-3.5 transition hover:bg-slate-100/70"
                title="Click to sort by Category"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortBy === 'category' ? 'font-bold text-blue-600' : ''}>
                    Category
                  </span>
                  {renderSortIcon('category')}
                </div>
              </th>

              {/* HOLDER */}
              <th
                onClick={() => onSort('holder')}
                className="group cursor-pointer select-none px-6 py-3.5 transition hover:bg-slate-100/70"
                title="Click to sort by Holder"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortBy === 'holder' ? 'font-bold text-blue-600' : ''}>
                    Current Holder
                  </span>
                  {renderSortIcon('holder')}
                </div>
              </th>

              {/* STATUS */}
              <th
                onClick={() => onSort('status')}
                className="group cursor-pointer select-none px-6 py-3.5 transition hover:bg-slate-100/70"
                title="Click to sort by Status"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortBy === 'status' ? 'font-bold text-blue-600' : ''}>
                    Status
                  </span>
                  {renderSortIcon('status')}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {/* LOADING SKELETON */}
            {isLoading && assets.length === 0 ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 w-28 rounded bg-slate-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-40 rounded bg-slate-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 rounded bg-slate-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 rounded bg-slate-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 w-24 rounded bg-slate-200" />
                  </td>
                </tr>
              ))
            ) : assets.length === 0 ? (
              /* EMPTY STATE */
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Boxes size={24} />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {hasFilter ? 'No matching assets found' : 'No assets yet'}
                    </p>
                    <p className="mt-1 max-w-sm text-xs text-slate-400">
                      {hasFilter
                        ? 'Try changing the search query or status filter.'
                        : 'Registered physical assets will appear here.'}
                    </p>
                    {hasFilter && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                      >
                        <RotateCcw size={13} />
                        <span>Reset Filters</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              /* ROWS */
              assets.map((asset) => (
                <tr key={asset.id} className="transition hover:bg-slate-50/80">
                  {/* ASSET TAG */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-800">
                      {asset.assetTag}
                    </span>
                  </td>

                  {/* ITEM */}
                  <td className="px-6 py-4">
                    <span className="line-clamp-1 font-semibold text-slate-900">
                      {asset.itemName}
                    </span>
                  </td>

                  {/* CATEGORY */}
                  <td className="whitespace-nowrap px-6 py-4 text-xs font-medium text-slate-700">
                    {asset.categoryName || '-'}
                  </td>

                  {/* HOLDER */}
                  <td className="px-6 py-4">
                    <AssetHolder asset={asset} />
                  </td>

                  {/* STATUS */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <AssetStatusBadge status={asset.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER + PAGING */}
      <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">
          Showing {assets.length} of {totalCount} assets
        </p>

        <div className="flex items-center justify-end gap-3">
          <span className="text-xs text-gray-500">
            Page {page} of {Math.max(totalPages, 1)}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            className="rounded-lg border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={17} />
          </button>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            className="rounded-lg border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default AssetTable;
