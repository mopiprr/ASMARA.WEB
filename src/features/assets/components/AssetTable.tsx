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
  UserPlus,
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
    <th className="px-6 py-4 font-semibold">
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1.5 uppercase tracking-wider transition hover:text-slate-600 ${
          isActive ? 'text-blue-600' : ''
        }`}
      >
        {label}
        <Icon size={13} className={isActive ? '' : 'opacity-50'} />
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
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* TABLE HEADER */}
      <div className="border-b border-slate-100 p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Boxes size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Assets
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {totalCount} asset(s) registered.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">

            {/* SEARCH */}
            <div className="relative w-full lg:w-72">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchInput}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search tag, item, holder..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* STATUS FILTER */}
            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <SortableHeader label="Asset Tag" field="assetTag" {...sortProps} />
              <SortableHeader label="Item" field="itemName" {...sortProps} />
              <SortableHeader label="Category" field="category" {...sortProps} />
              <SortableHeader label="Holder" field="holder" {...sortProps} />
              <SortableHeader label="Status" field="status" {...sortProps} />
              <th className="px-6 py-4 font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading && assets.length === 0 ? (

              /* LOADING */
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <RefreshCw size={28} className="mx-auto animate-spin text-blue-500" />

                  <p className="mt-3 text-sm text-slate-500">
                    Loading assets...
                  </p>
                </td>
              </tr>

            ) : error ? (

              /* ERROR */
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <AlertCircle size={32} className="mx-auto text-red-400" />

                  <p className="mt-3 font-semibold text-red-600">
                    Failed to load assets
                  </p>

                  <p className="mt-1 text-sm text-slate-500">{error}</p>

                  <button
                    type="button"
                    onClick={onRefresh}
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </td>
              </tr>

            ) : assets.length === 0 ? (

              /* EMPTY */
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <Boxes size={44} className="mx-auto text-slate-300" />

                  <h3 className="mt-4 text-sm font-semibold text-slate-700">
                    {hasFilter ? 'No matching assets found' : 'No assets yet'}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {hasFilter
                      ? 'Try changing the search or filter.'
                      : 'Registered assets will appear here.'}
                  </p>
                </td>
              </tr>

            ) : (

              /* ROWS */
              assets.map((asset) => (
                <tr key={asset.id} className="transition hover:bg-slate-50/70">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-800">
                      {asset.assetTag}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-medium text-slate-800">
                    {asset.itemName}
                  </td>

                  <td className="px-6 py-4 text-slate-500">
                    {asset.categoryName}
                  </td>

                  <td className="px-6 py-4">
                    <AssetHolder asset={asset} />
                  </td>

                  <td className="px-6 py-4">
                    <AssetStatusBadge status={asset.status} />
                  </td>

                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => onAssign(asset)}
                      disabled={!canAssignAsset(asset.status)}
                      title={
                        canAssignAsset(asset.status)
                          ? 'Assign to employee'
                          : 'Only Available or In Use assets can be assigned'
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-transparent disabled:hover:text-slate-600"
                    >
                      <UserPlus size={15} />
                      Assign
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER + PAGING */}
      <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center">
        <p className="text-xs text-slate-400">
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