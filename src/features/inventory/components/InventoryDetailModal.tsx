import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Package, Tag, Copy, Check, Hash, Layers, ShieldCheck, ShieldAlert, Boxes, ArrowRight } from 'lucide-react';
import type { InventoryItem, InventoryCategory } from '../types/inventory.types';
import { getStockStatus, getTrackingTypeLabel, getStockQty } from '../utils/inventory.utils';

interface InventoryDetailModalProps {
  item: InventoryItem | null;
  categories: InventoryCategory[];
  onClose: () => void;
}

export function InventoryDetailModal({ item, categories, onClose }: InventoryDetailModalProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const category = categories.find((c) => c.id === item.itemCategoryId);
  const trackingInfo = category ? getTrackingTypeLabel(category.trackingType) : null;
  const stockInfo = getStockStatus(getStockQty(item));

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(item.itemCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Inventory Item Details</h2>
              <p className="text-xs text-slate-400">Item specifications and stock availability</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-5">
          {/* ITEM NAME & CODE HERO */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Item Name</span>
            <h3 className="mt-0.5 text-lg font-bold text-slate-800">{item.itemName}</h3>

            <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-3">
              <div className="flex items-center gap-2">
                <Hash size={15} className="text-slate-400" />
                <span className="font-mono text-xs font-semibold text-slate-700">{item.itemCode}</span>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white transition shadow-2xs border border-transparent hover:border-slate-200"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy SKU</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* DETAILS GRID */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="rounded-xl border border-slate-200 p-3.5">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                <Tag size={14} />
                <span>Category</span>
              </div>
              <p className="font-semibold text-slate-800 text-sm">
                {item.categoryName || category?.categoryName || '-'}
              </p>
            </div>

            {/* Tracking Type */}
            <div className="rounded-xl border border-slate-200 p-3.5">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                <Layers size={14} />
                <span>Tracking Type</span>
              </div>
              {trackingInfo ? (
                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${trackingInfo.colorClass}`}>
                  {trackingInfo.label}
                </span>
              ) : (
                <span className="text-sm text-slate-500">-</span>
              )}
            </div>

            {/* Stock Level */}
            <div className="rounded-xl border border-slate-200 p-3.5">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                <Package size={14} />
                <span>
                  {category?.trackingType === 2 || item.trackingType === 2
                    ? 'Stock Ready in Storage'
                    : 'Physical Stock on Hand'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-800">
                  {getStockQty(item)}
                </span>
                <span className="text-xs text-slate-500">
                  {category?.trackingType === 2 || item.trackingType === 2
                    ? `(/${item.totalAssetCount ?? 0})`
                    : 'units'}
                </span>
              </div>
            </div>

            {/* Stock Status Badge */}
            <div className="rounded-xl border border-slate-200 p-3.5">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                <span className={`h-2 w-2 rounded-full ${stockInfo.dotClass}`} />
                <span>Stock Condition</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${stockInfo.badgeClass}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${stockInfo.dotClass}`} />
                {stockInfo.label}
              </span>
            </div>
          </div>

          {/* NON-CONSUMABLE ASSET TRACKING BANNER */}
          {(category?.trackingType === 2 || item.trackingType === 2) && (
            <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/60 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Boxes size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Serialized Fixed Asset
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {getStockQty(item)} ready in storage · {item.totalAssetCount ?? 0} total units tracked individually
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/assets?search=${encodeURIComponent(item.itemName)}`);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition"
              >
                <span>Lihat di Aset</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* CATALOG STATUS */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 bg-white">
            <span className="text-xs font-medium text-slate-500">Catalog Status</span>
            {item.isActive ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <ShieldCheck size={15} className="text-emerald-500" />
                Active (Available for transaction)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <ShieldAlert size={15} className="text-slate-400" />
                Inactive (Archived)
              </span>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default InventoryDetailModal;
