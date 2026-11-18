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
  Pencil,
  Trash2,
  AlertCircle,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ShieldAlert,
  Lock,
  X,
} from 'lucide-react';
import type {
  InventoryItem,
  InventoryCategory,
  StockStatusFilter,
} from '../types/inventory.types';
import {
  getStockStatus,
  getStockStatusRank,
  getTrackingTypeLabel,
  getStockQty,
  isNonConsumable,
} from '../utils/inventory.utils';

export type SortColumn =
  | 'itemCode'
  | 'itemName'
  | 'categoryName'
  | 'qty'
  | 'stockStatus'
  | 'isActive';
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
  onEditItem?: (item: InventoryItem) => void;
  onDeleteItem?: (item: InventoryItem) => void;
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
  onEditItem,
  onDeleteItem,
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
          const catA =
            a.categoryName ??
            categoryMap.get(a.itemCategoryId)?.categoryName ??
            '';
          const catB =
            b.categoryName ??
            categoryMap.get(b.itemCategoryId)?.categoryName ??
            '';
          comparison = catA.localeCompare(catB);
          break;
        }
        case 'qty': {
          const qtyA = getStockQty(a);
          const qtyB = getStockQty(b);
          comparison = qtyA - qtyB;
          break;
        }
        case 'stockStatus': {
          const rankA = getStockStatusRank(getStockQty(a));
          const rankB = getStockStatusRank(getStockQty(b));
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
          size={12}
          className="text-slate-300 transition group-hover:text-slate-500"
        />
      );
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} className="text-blue-600" />
    ) : (
      <ArrowDown size={12} className="text-blue-600" />
    );
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      {/* FILTER & CONTROLS HEADER */}
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Package size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">
                    Inventory Catalog
                  </h2>
                  {!isRestricted && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {totalItems.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Katalog perlengkapan kantor, stok habis pakai, dan referensi unit aset
                </p>
              </div>
            </div>

            {hasActiveFilters && !isRestricted && (
              <button
                type="button"
                onClick={() => {
                  onResetFilters();
                  setCurrentPage(1);
                }}
                className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <RotateCcw size={12} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* FILTER CONTROLS BAR */}
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
            {/* SEARCH INPUT */}
            <div className="relative flex-1">
              {isRestricted ? (
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500"
                />
              ) : (
                <Search
                  size={15}
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
                className={`h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-8 text-xs text-slate-800 placeholder-slate-400 outline-none transition ${
                  isRestricted
                    ? 'cursor-not-allowed opacity-60'
                    : 'focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {search && !isRestricted && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* CATEGORY & STOCK SELECTS */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:flex lg:items-center">
              <div className="relative w-full sm:w-52 lg:w-56">
                <Filter
                  size={13}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  disabled={isRestricted}
                  value={selectedCategory}
                  onChange={(e) => {
                    const val =
                      e.target.value === 'all' ? 'all' : Number(e.target.value);
                    onCategoryChange(val);
                    setCurrentPage(1);
                  }}
                  className={`h-9 w-full truncate rounded-xl border border-slate-200 bg-slate-50/80 pl-8 pr-3 text-xs font-medium text-slate-700 outline-none transition ${
                    isRestricted
                      ? 'cursor-not-allowed opacity-60'
                      : 'cursor-pointer focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100'
                  }`}
                >
                  <option value="all">
                    All Categories ({categories.length})
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.categoryName} ({cat.categoryCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative w-full sm:w-52 lg:w-52">
                <select
                  disabled={isRestricted}
                  value={stockStatus}
                  onChange={(e) => {
                    onStockStatusChange(e.target.value as StockStatusFilter);
                    setCurrentPage(1);
                  }}
                  className={`h-9 w-full truncate rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs font-medium text-slate-700 outline-none transition ${
                    isRestricted
                      ? 'cursor-not-allowed opacity-60'
                      : 'cursor-pointer focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100'
                  }`}
                >
                  <option value="all">All Stock Conditions</option>
                  <option value="in_stock">In Stock (Available)</option>
                  <option value="low_stock">Low Stock (&lt; 5)</option>
                  <option value="out_of_stock">Out of Stock (Depleted)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="m-5 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-rose-600 px-3 py-1 font-semibold text-white transition hover:bg-rose-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th
                onClick={() => handleSort('itemCode')}
                className="group cursor-pointer select-none px-5 py-3.5 transition-colors hover:text-slate-700"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortColumn === 'itemCode' ? 'text-blue-700' : ''}>
                    SKU Code
                  </span>
                  {renderSortIcon('itemCode')}
                </div>
              </th>

              <th
                onClick={() => handleSort('itemName')}
                className="group cursor-pointer select-none px-5 py-3.5 transition-colors hover:text-slate-700"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortColumn === 'itemName' ? 'text-blue-700' : ''}>
                    Item Name
                  </span>
                  {renderSortIcon('itemName')}
                </div>
              </th>

              <th
                onClick={() => handleSort('categoryName')}
                className="group cursor-pointer select-none px-5 py-3.5 transition-colors hover:text-slate-700"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={
                      sortColumn === 'categoryName' ? 'text-blue-700' : ''
                    }
                  >
                    Category & Tracking
                  </span>
                  {renderSortIcon('categoryName')}
                </div>
              </th>

              <th
                onClick={() => handleSort('qty')}
                className="group cursor-pointer select-none px-5 py-3.5 transition-colors hover:text-slate-700"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortColumn === 'qty' ? 'text-blue-700' : ''}>
                    Stock Qty
                  </span>
                  {renderSortIcon('qty')}
                </div>
              </th>

              <th
                onClick={() => handleSort('stockStatus')}
                className="group cursor-pointer select-none px-5 py-3.5 transition-colors hover:text-slate-700"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={
                      sortColumn === 'stockStatus' ? 'text-blue-700' : ''
                    }
                  >
                    Stock Condition
                  </span>
                  {renderSortIcon('stockStatus')}
                </div>
              </th>

              <th
                onClick={() => handleSort('isActive')}
                className="group cursor-pointer select-none px-5 py-3.5 transition-colors hover:text-slate-700"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortColumn === 'isActive' ? 'text-blue-700' : ''}>
                    Status
                  </span>
                  {renderSortIcon('isActive')}
                </div>
              </th>

              <th className="px-5 py-3.5 text-right font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-5 py-3.5">
                    <div className="h-5 w-20 rounded-md bg-slate-200" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-4 w-40 rounded bg-slate-200" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-4 w-28 rounded bg-slate-200" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-4 w-14 rounded bg-slate-200" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-5 w-20 rounded-full bg-slate-200" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="h-4 w-16 rounded bg-slate-200" />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="ml-auto h-7 w-28 rounded-lg bg-slate-200" />
                  </td>
                </tr>
              ))
            ) : isRestricted ? (
              <tr>
                <td colSpan={7} className="px-6 py-14 text-center">
                  <div className="mx-auto flex max-w-md flex-col items-center justify-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200/80 bg-amber-50 text-amber-700">
                      <ShieldAlert size={24} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Data Inventaris Dibatasi
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                      Informasi katalog barang fisik dan kuantitas stok gudang
                      hanya dapat diakses oleh staf berwenang dari{' '}
                      <strong>Departemen Inventory (ROL-06)</strong>.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate('/procurement')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
                      >
                        <Package size={13} />
                        <span>Pengajuan Procurement</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/maintenance')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <span>Pengajuan Maintenance</span>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-14 text-center">
                  <Package size={36} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No inventory items found
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
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
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
                    >
                      <RotateCcw size={13} />
                      <span>Reset Filters</span>
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => {
                const stock = getStockStatus(getStockQty(item));
                const category = categoryMap.get(item.itemCategoryId);
                const tracking = category
                  ? getTrackingTypeLabel(category.trackingType)
                  : null;

                return (
                  <tr
                    key={item.id}
                    onClick={() => onViewItem(item)}
                    className="cursor-pointer transition-colors hover:bg-slate-50/80"
                  >
                    {/* SKU CODE */}
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span className="inline-flex items-center rounded-md border border-slate-200/80 bg-slate-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-800">
                        {item.itemCode}
                      </span>
                    </td>

                    {/* ITEM NAME */}
                    <td className="px-5 py-3.5">
                      <p className="line-clamp-2 font-semibold text-slate-900">
                        {item.itemName}
                      </p>
                    </td>

                    {/* CATEGORY & TRACKING */}
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-700">
                          {item.categoryName || category?.categoryName || '-'}
                        </span>
                        {tracking && (
                          <span
                            className={`inline-flex w-fit items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${tracking.colorClass}`}
                          >
                            <Layers size={10} />
                            {tracking.label}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* QUANTITY */}
                    <td className="whitespace-nowrap px-5 py-3.5">
                      {isNonConsumable(item) ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-slate-900">
                              {getStockQty(item)}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              /{item.totalAssetCount ?? 0}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/assets?search=${encodeURIComponent(item.itemName)}`
                              );
                            }}
                            className="inline-flex w-fit items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            <span>See Units</span>
                            <ArrowRight size={10} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-slate-900">
                            {getStockQty(item)}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            units
                          </span>
                        </div>
                      )}
                    </td>

                    {/* STOCK CONDITION */}
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${stock.badgeClass}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${stock.dotClass}`}
                        />
                        {stock.label}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="whitespace-nowrap px-5 py-3.5">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* COMPACT HORIZONTAL ACTIONS */}
                    <td className="whitespace-nowrap px-5 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewItem(item);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-2xs transition-colors hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-700"
                          title="Lihat detail spesifikasi"
                        >
                          <Eye size={13} />
                          <span>Detail</span>
                        </button>

                        {onEditItem && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditItem(item);
                            }}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-amber-600 shadow-2xs transition-colors hover:border-amber-200 hover:bg-amber-50"
                            title="Ubah data / stok barang"
                            aria-label="Edit item"
                          >
                            <Pencil size={13} />
                          </button>
                        )}

                        {onDeleteItem && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteItem(item);
                            }}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-rose-600 shadow-2xs transition-colors hover:border-rose-200 hover:bg-rose-50"
                            title="Nonaktifkan barang"
                            aria-label="Delete item"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:px-6">
        <span>
          Total <strong className="text-slate-700">{totalItems}</strong> item(s)
        </span>

        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={15} />
          </button>

          <span className="px-2 font-semibold text-slate-700">
            {currentPage} / {Math.max(totalPages, 1)}
          </span>

          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
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

export default InventoryTable;