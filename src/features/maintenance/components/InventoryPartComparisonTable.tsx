import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  LoaderCircle,
  Package,
  Sparkles,
} from 'lucide-react';

import type { SparePartItem } from '../../inventory/types/inventory.types';

export interface RequiredPart {
  itemName: string;
  note?: string;
  quantity?: number;
  itemCategoryId?: number;
  itemId?: number | null;
}

export function evaluatePartRequirementAvailability(
  requiredParts: RequiredPart[],
  spareParts: SparePartItem[],
): boolean {
  if (requiredParts.length === 0) return false;
  return requiredParts.every((part) => {
    const requestedQty = part.quantity && part.quantity > 0 ? part.quantity : 1;
    let match: SparePartItem | null = null;
    if (part.itemId !== null && part.itemId !== undefined) {
      match = spareParts.find((sp) => sp.id === part.itemId) ?? null;
    } else {
      const normalizedName = part.itemName.trim().toLowerCase();
      match =
        spareParts.find(
          (sp) => sp.itemName.trim().toLowerCase() === normalizedName,
        ) ?? null;
    }
    if (!match) return false;
    return match.stock >= requestedQty && match.stock > 0;
  });
}

interface InventoryPartComparisonTableProps {
  requiredParts: RequiredPart[];
  spareParts: SparePartItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

type StockAvailabilityStatus =
  | 'SUFFICIENT'
  | 'INSUFFICIENT'
  | 'OUT_OF_STOCK'
  | 'NOT_REGISTERED';

interface EvaluatedPart {
  part: RequiredPart;
  matchingItem: SparePartItem | null;
  status: StockAvailabilityStatus;
  requestedQty: number;
  availableStock: number | null;
}

export function InventoryPartComparisonTable({
  requiredParts,
  spareParts,
  isLoading,
  error,
  onRetry,
}: InventoryPartComparisonTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-6 text-xs text-slate-500">
        <LoaderCircle size={16} className="animate-spin text-blue-600" />
        <span>Checking spare part inventory stock...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
        <div className="flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="font-bold underline hover:no-underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (requiredParts.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-400">
        No spare part requirements attached to this ticket.
      </div>
    );
  }

  // EVALUATE EACH REQUESTED PART AGAINST LIVE INVENTORY
  const evaluatedParts: EvaluatedPart[] = requiredParts.map((part) => {
    const requestedQty = part.quantity && part.quantity > 0 ? part.quantity : 1;

    // Match by itemId if available, or fallback to matching itemName
    let match: SparePartItem | null = null;
    if (part.itemId !== null && part.itemId !== undefined) {
      match = spareParts.find((sp) => sp.id === part.itemId) ?? null;
    } else {
      const normalizedName = part.itemName.trim().toLowerCase();
      match =
        spareParts.find(
          (sp) => sp.itemName.trim().toLowerCase() === normalizedName,
        ) ?? null;
    }

    if (!match) {
      return {
        part,
        matchingItem: null,
        status: 'NOT_REGISTERED',
        requestedQty,
        availableStock: null,
      };
    }

    const availableStock = match.stock;

    if (availableStock <= 0) {
      return {
        part,
        matchingItem: match,
        status: 'OUT_OF_STOCK',
        requestedQty,
        availableStock: 0,
      };
    }

    if (availableStock < requestedQty) {
      return {
        part,
        matchingItem: match,
        status: 'INSUFFICIENT',
        requestedQty,
        availableStock,
      };
    }

    return {
      part,
      matchingItem: match,
      status: 'SUFFICIENT',
      requestedQty,
      availableStock,
    };
  });

  const allSufficient = evaluatedParts.every(
    (item) => item.status === 'SUFFICIENT',
  );

  return (
    <div className="space-y-3.5">
      {/* COMPARISON TABLE / CARD CONTAINER */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-slate-600" />
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Required Parts vs Warehouse Stock Comparison
            </h5>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Comparison between technician-requested parts and real-time inventory stock in the warehouse.
          </p>
        </div>

        {/* DESKTOP TABLE VIEW */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500">
              <tr>
                <th className="py-2.5 pl-4 pr-3">Requested Part</th>
                <th className="px-3 py-2.5">Item Type</th>
                <th className="px-3 py-2.5 text-center">Requested Qty</th>
                <th className="px-3 py-2.5 text-center">Warehouse Stock</th>
                <th className="py-2.5 pl-3 pr-4 text-right">Availability Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evaluatedParts.map((item, idx) => {
                const { part, matchingItem, status, requestedQty, availableStock } =
                  item;

                return (
                  <tr
                    key={idx}
                    className="transition-colors hover:bg-slate-50/50"
                  >
                    {/* PART NAME & DETAILS */}
                    <td className="py-3 pl-4 pr-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-800">
                          {part.itemName}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                          {matchingItem?.itemCode && (
                            <span className="font-mono text-slate-600">
                              [{matchingItem.itemCode}]
                            </span>
                          )}
                          {matchingItem?.categoryName && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.2">
                              {matchingItem.categoryName}
                            </span>
                          )}
                          {part.note && (
                            <span className="italic text-slate-400">
                              &ldquo;{part.note}&rdquo;
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* ITEM TYPE */}
                    <td className="px-3 py-3">
                      {matchingItem ? (
                        <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          Warehouse Catalog
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                          Custom / Manual
                        </span>
                      )}
                    </td>

                    {/* QTY REQUEST */}
                    <td className="px-3 py-3 text-center">
                      <span className="font-bold text-slate-800">
                        {requestedQty} units
                      </span>
                    </td>

                    {/* WAREHOUSE STOCK */}
                    <td className="px-3 py-3 text-center">
                      {availableStock !== null ? (
                        <span
                          className={`font-bold ${
                            availableStock > 0
                              ? 'text-slate-800'
                              : 'text-rose-600'
                          }`}
                        >
                          {availableStock} units
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          -
                        </span>
                      )}
                    </td>

                    {/* AVAILABILITY STATUS BADGE */}
                    <td className="py-3 pl-3 pr-4 text-right">
                      {status === 'SUFFICIENT' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Sufficient
                        </span>
                      ) : status === 'INSUFFICIENT' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Insufficient ({availableStock}/{requestedQty})
                        </span>
                      ) : status === 'OUT_OF_STOCK' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          Out of Stock (0)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                          Not in Catalog
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="divide-y divide-slate-100 sm:hidden">
          {evaluatedParts.map((item, idx) => {
            const { part, matchingItem, status, requestedQty, availableStock } =
              item;

            return (
              <div key={idx} className="space-y-2 p-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {part.itemName}
                    </p>
                    {matchingItem?.itemCode && (
                      <p className="font-mono text-[10px] text-slate-500">
                        [{matchingItem.itemCode}]
                      </p>
                    )}
                  </div>

                  {status === 'SUFFICIENT' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Sufficient
                    </span>
                  ) : status === 'INSUFFICIENT' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      Insufficient
                    </span>
                  ) : status === 'OUT_OF_STOCK' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                      Out of Stock (0)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                      Not in Catalog
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px]">
                  <span className="text-slate-500">
                    Request: <strong className="text-slate-700">{requestedQty} units</strong>
                  </span>
                  <span className="text-slate-500">
                    Stock:{' '}
                    <strong
                      className={
                        availableStock !== null && availableStock > 0
                          ? 'text-slate-700'
                          : 'text-rose-600'
                      }
                    >
                      {availableStock !== null ? `${availableStock} units` : '-'}
                    </strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SMART RECOMMENDATION HELPER BANNER */}
      {allSufficient ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-900">
          <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" />
          <div className="leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <Sparkles size={14} />
              <span>Recommendation: All Spare Parts Available in Warehouse</span>
            </div>
            <p className="mt-0.5 text-emerald-700">
              All spare parts requested by the technician are available in warehouse stock in sufficient quantity. You can confirm part availability by choosing <strong>Available</strong>.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900">
          <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-600" />
          <div className="leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <Info size={14} />
              <span>Notice: Missing or Insufficient Stock Detected</span>
            </div>
            <p className="mt-0.5 text-amber-700">
              One or more requested parts are not registered in the catalog, out of stock, or have insufficient quantity. The <strong>Available</strong> option is locked. Please select <strong>Not Available</strong> to direct this ticket to spare part procurement (Order Part).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
