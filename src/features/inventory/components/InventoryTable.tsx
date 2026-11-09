import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import type {
  InventoryItem,
  InventoryCategory,
  StockStatusFilter,
} from '../types/inventory.types';
import { getStockStatus, getStockStatusRank, getTrackingTypeLabel } from '../utils/inventory.utils';

export type SortColumn = 'itemCode' | 'itemName' | 'categoryName' | 'qty' | 'stockStatus' | 'isActive';
export type SortDirection = 'asc' | 'desc';

interface InventoryTableProps {
  items: InventoryItem[];
  categories: InventoryCategory[];
  isLoading: boolean;
  isRestricted?: boolean;
  error: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: number | 'all';
  onCategoryChange: (value: number | 'all') => void;
  stockStatus: StockStatusFilter;
  onStockStatusChange: (value: StockStatusFilter) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  onViewItem: (item: InventoryItem) => void;
  onRetry: () => void;
}

const ITEMS_PER_PAGE = 10;

export function InventoryTable({
  items,
  categories,
  isLoading,
  isRestricted = false,
  error,
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  stockStatus,
  onStockStatusChange,
  onResetFilters,
  hasActiveFilters,
  onViewItem,
  onRetry,
}: InventoryTableProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>('itemName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Build category lookup map for fast tracking type and category name lookup
  const categoryMap = useMemo(() => {
    const map = new Map<number, InventoryCategory>();
    for (const cat of categories) {
      map.set(cat.id, cat);
    }
    return map;
  }, [categories]);

  // Handle Sort Click
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection(column === 'qty' ? 'desc' : 'asc');
    }
  };

  // Sort filtered items
  const sortedItems = useMemo(() => {
    const result = [...items];
    if (!sortColumn) return result;

    return result.sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case 'itemCode':
          comparison = a.itemCode.localeCompare(b.itemCode);
          break;
        case 'itemName':
          comparison = a.itemName.localeCompare(b.itemName);
          break;
        case 'categoryName': {
          const catA = a.categoryName ?? categoryMap.get(a.itemCategoryId)?.categoryName ?? '';
          const catB = b.categoryName ?? categoryMap.get(b.itemCategoryId)?.categoryName ?? '';
          comparison = catA.localeCompare(catB);
          break;
        }
        case 'qty': {
          const qtyA = a.qty ?? 0;
          const qtyB = b.qty ?? 0;
          comparison = qtyA - qtyB;
          break;
        }
        case 'stockStatus': {
          const rankA = getStockStatusRank(a.qty);
          const rankB = getStockStatusRank(b.qty);
          comparison = rankA - rankB;
          break;
        }
        case 'isActive':
          comparison = a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1;
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [items, sortColumn, sortDirection, categoryMap]);

  const totalItems = sortedItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  // Active page slice
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedItems, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Helper for render sort icon
  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return (
        <ArrowUpDown
          size={13}
          className="text-slate-300 transition group-hover:text-slate-500"
        />
      );
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={13} className="text-blue-600" />
    ) : (
      <ArrowDown size={13} className="text-blue-600" />
    );
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* FILTER & CONTROLS HEADER */}
      <div className="border-b border-slate-100 p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Inventory Items</h2>
              <p className="text-xs text-slate-500">
                Search and filter office supplies and inventory catalog.
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  onResetFilters();
                  setCurrentPage(1);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <RotateCcw size={13} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* FILTER CONTROLS BAR: Search is largest (flex-1), Category & Stock are equal smaller size */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* SEARCH INPUT - LARGEST */}
            <div className="relative flex-1">
              {isRestricted ? (
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500"
                />
              ) : (
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              )}
              <input
                type="text"
                disabled={isRestricted}
                value={search}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={
                  isRestricted
                    ? 'Search is disabled (Inventory data restricted)...'
                    : 'Search SKU code or item name...'
                }
                className={`w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition ${
                  isRestricted
                    ? 'cursor-not-allowed opacity-60'
                    : 'focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100'
                }`}
              />
            </div>

            {/* SMALLER CONTROLS: Category & Stock (equal size) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:items-center">
              {/* CATEGORY SELECT */}
              <div className="relative w-full sm:w-52 lg:w-56">
                <Filter
                  size={14}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  disabled={isRestricted}
                  value={selectedCategory}
                  onChange={(e) => {
                    const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                    onCategoryChange(val);
                    setCurrentPage(1);
                  }}
                  className={`w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-9 pr-8 text-xs font-bold text-slate-800 outline-none transition truncate ${
                    isRestricted
                      ? 'cursor-not-allowed opacity-60'
                      : 'cursor-pointer focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100'
                  }`}
                >
                  <option value="all" className="font-bold">
                    All Categories ({categories.length})
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="font-semibold">
                      {cat.categoryName} ({cat.categoryCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* STOCK STATUS SELECT */}
              <div className="relative w-full sm:w-52 lg:w-56">
                <select
                  disabled={isRestricted}
                  value={stockStatus}
                  onChange={(e) => {
                    onStockStatusChange(e.target.value as StockStatusFilter);
                    setCurrentPage(1);
                  }}
                  className={`w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 px-3.5 text-xs font-bold text-slate-800 outline-none transition truncate ${
                    isRestricted
                      ? 'cursor-not-allowed opacity-60'
                      : 'cursor-pointer focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100'
                  }`}
                >
                  <option value="all" className="font-bold">
                    All Stock Conditions
                  </option>
                  <option value="in_stock" className="font-semibold">
                    In Stock (Available)
                  </option>
                  <option value="low_stock" className="font-semibold">
                    Low Stock (&lt; 5)
                  </option>
                  <option value="out_of_stock" className="font-semibold">
                    Out of Stock (Depleted)
                  </option>
                </select>
              </div>
            </div>
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
            onClick={onRetry}
            className="rounded-lg bg-rose-600 px-3 py-1 font-semibold text-white hover:bg-rose-700 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-xs">
          <thead className="bg-slate-50 uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              {/* SKU CODE (SORTABLE) */}
              <th
                onClick={() => handleSort('itemCode')}
                className="group cursor-pointer select-none px-6 py-3.5 transition hover:bg-slate-100/70"
                title="Click to sort by SKU Code"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortColumn === 'itemCode' ? 'text-blue-600 font-bold' : ''}>
                    SKU Code
                  </span>
                  {renderSortIcon('itemCode')}
                </div>
              </th>

              {/* ITEM NAME (SORTABLE) */}
              <th
                onClick={() => handleSort('itemName')}
                className="group cursor-pointer select-none px-6 py-3.5 transition hover:bg-slate-100/70"
                title="Click to sort by Item Name"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortColumn === 'itemName' ? 'text-blue-600 font-bold' : ''}>
                    Item Name
                  </span>
                  {renderSortIcon('itemName')}
                </div>
              </th>

              {/* CATEGORY & TRACKING (SORTABLE) */}
              <th
                onClick={() => handleSort('categoryName')}
                className="group cursor-pointer select-none px-6 py-3.5 transition hover:bg-slate-100/70"
                title="Click to sort by Category"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortColumn === 'categoryName' ? 'text-blue-600 font-bold' : ''}>
                    Category & Tracking
                  </span>
                  {renderSortIcon('categoryName')}
                </div>
              </th>

              {/* STOCK QTY (SORTABLE) */}
              <th
                onClick={() => handleSort('qty')}
                className="group cursor-pointer select-none px-6 py-3.5 transition hover:bg-slate-100/70"
                title="Click to sort by Stock Qty"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortColumn === 'qty' ? 'text-blue-600 font-bold' : ''}>
                    Stock Qty
                  </span>
                  {renderSortIcon('qty')}
                </div>
              </th>

              {/* STOCK CONDITION (SORTABLE) */}
              <th
                onClick={() => handleSort('stockStatus')}
                className="group cursor-pointer select-none px-6 py-3.5 transition hover:bg-slate-100/70"
                title="Click to sort by Stock Condition"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortColumn === 'stockStatus' ? 'text-blue-600 font-bold' : ''}>
                    Stock Condition
                  </span>
                  {renderSortIcon('stockStatus')}
                </div>
              </th>

              {/* STATUS (SORTABLE) */}
              <th
                onClick={() => handleSort('isActive')}
                className="group cursor-pointer select-none px-6 py-3.5 transition hover:bg-slate-100/70"
                title="Click to sort by Status"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortColumn === 'isActive' ? 'text-blue-600 font-bold' : ''}>
                    Status
                  </span>
                  {renderSortIcon('isActive')}
                </div>
              </th>

              {/* ACTION (NOT SORTABLE) */}
              <th className="px-6 py-3.5 text-right font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 rounded bg-slate-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-36 rounded bg-slate-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 rounded bg-slate-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-12 rounded bg-slate-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 w-20 rounded bg-slate-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 w-16 rounded bg-slate-200" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="ml-auto h-7 w-16 rounded bg-slate-200" />
                  </td>
                </tr>
              ))
            ) : isRestricted ? (
              // Access Restricted State
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mb-4 shadow-xs">
                      <ShieldAlert size={28} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">
                      Data Inventaris Dibatasi
                    </h3>
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                      Informasi katalog barang fisik, kuantitas stok gudang, dan rincian unit hanya dapat diakses oleh staf berwenang dari <strong>Departemen Inventory (ROL-06)</strong>.
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Jika Anda membutuhkan barang inventaris atau perbaikan alat, Anda dapat membuat pengajuan tiket resmi.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => navigate('/procurement')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
                      >
                        <Package size={14} />
                        <span>Pengajuan Procurement</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/maintenance')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <span>Pengajuan Maintenance</span>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                      <Package size={24} />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">No inventory items found</p>
                    <p className="mt-1 text-xs text-slate-400 max-w-sm">
                      {hasActiveFilters
                        ? 'No items match your filter or search criteria.'
                        : 'No inventory items registered in the system yet.'}
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={() => {
                          onResetFilters();
                          setCurrentPage(1);
                        }}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                      >
                        <RotateCcw size={13} />
                        <span>Reset Filters</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              // Items List
              paginatedItems.map((item) => {
                const stock = getStockStatus(item.qty);
                const category = categoryMap.get(item.itemCategoryId);
                const tracking = category ? getTrackingTypeLabel(category.trackingType) : null;

                return (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50/80 cursor-pointer"
                    onClick={() => onViewItem(item)}
                  >
                    {/* SKU CODE */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-800">
                        {item.itemCode}
                      </span>
                    </td>

                    {/* ITEM NAME */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900 line-clamp-1">
                        {item.itemName}
                      </span>
                    </td>

                    {/* CATEGORY & TRACKING TYPE */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-800">
                          {item.categoryName || category?.categoryName || '-'}
                        </span>
                        {tracking && (
                          <span
                            className={`inline-flex items-center gap-1 w-fit rounded px-1.5 py-0.5 text-[10px] font-semibold border ${tracking.colorClass}`}
                          >
                            <Layers size={10} />
                            {tracking.label}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* QUANTITY */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category?.trackingType === 2 || item.trackingType === 2 ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-slate-900">
                              {item.availableAssetCount ?? item.qty ?? 0}
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-600">
                              Ready
                            </span>
                            {item.totalAssetCount !== null && item.totalAssetCount !== undefined && (
                              <span className="text-[11px] text-slate-400">
                                / {item.totalAssetCount} Total
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/assets?search=${encodeURIComponent(item.itemName)}`);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline w-fit"
                            title="Buka unit aset individual di Asset Management"
                          >
                            <span>Lihat unit fisik</span>
                            <ArrowRight size={10} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-slate-900">
                            {item.qty !== null && item.qty !== undefined ? item.qty : 0}
                          </span>
                          <span className="text-slate-400 text-[11px]">unit(s)</span>
                        </div>
                      )}
                    </td>

                    {/* STOCK STATUS BADGE */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${stock.badgeClass}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${stock.dotClass}`} />
                        {stock.label}
                      </span>
                    </td>

                    {/* CATALOG ACTIVE BADGE */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewItem(item);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        title="View item details"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION: Identical to PendingProcurementTable */}
      <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">
          Total {totalItems} item(s)
        </p>

        <div className="flex items-center justify-end gap-3">
          <span className="text-xs text-gray-500">
            Page {currentPage} of {Math.max(totalPages, 1)}
          </span>

          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="rounded-lg border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={17} />
          </button>

          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
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

export default InventoryTable;
