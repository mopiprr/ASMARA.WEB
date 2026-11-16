import { Wrench } from 'lucide-react';

import type { MaintenanceDetail } from '../../types/maintenance.types';

import { REPAIR_RESULT_LABELS } from '../../utils/maintenance.utils';
import { parseRequiredParts } from '../../utils/maintenanceDetail.utils';

interface AssetInfoSectionProps {
  detail: MaintenanceDetail | null;
}

// Asset yang di-maintenance + hasil pemeriksaan handler.
function AssetInfoSection({ detail }: AssetInfoSectionProps) {
  if (!detail) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
        No maintenance detail available.
      </div>
    );
  }

  const parts = parseRequiredParts(detail.partRequirement);

  // Format lama: teks biasa (bukan JSON).
  const legacyPartText = parts.length === 0 ? detail.partRequirement : null;

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Wrench size={17} className="text-slate-500" />
        <h3 className="text-sm font-bold text-slate-800">
          Asset Information
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-slate-400">Asset</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {detail.assetItemName || '-'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            <span className="font-mono">{detail.assetTag || '-'}</span>
            {detail.assetCategoryName && <> · {detail.assetCategoryName}</>}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400">Repair Result</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {detail.repairResult ? REPAIR_RESULT_LABELS[detail.repairResult] ?? '-' : 'Not inspected yet'}
          </p>
        </div>

        <div className="sm:col-span-2">
          <p className="text-xs text-slate-400">Problem Description</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
            {detail.description || '-'}
          </p>
        </div>

        {detail.handlerNote && (
          <div className="sm:col-span-2">
            <p className="text-xs text-slate-400">Handler Note</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {detail.handlerNote}
            </p>
          </div>
        )}

        {(parts.length > 0 || legacyPartText) && (
          <div className="sm:col-span-2">
            <p className="text-xs text-slate-400">Required Spare Parts</p>

            {parts.length > 0 ? (
              <ul className="mt-2 space-y-1.5">
                {parts.map((part, index) => (
                  <li
                    key={`${part.itemName}-${index}`}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-slate-800">
                      {index + 1}. {part.itemName}
                    </span>
                    {part.quantity ? (
                      <span className="text-xs font-semibold text-slate-500">
                        Qty: {part.quantity}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{legacyPartText}</p>
            )}
          </div>
        )}

        {detail.replacementAssetTag && (
          <div>
            <p className="text-xs text-slate-400">Replacement Asset</p>
            <p className="mt-1 text-sm font-semibold text-emerald-700">
              {detail.replacementAssetItemName || '-'}
            </p>
            <p className="mt-0.5 font-mono text-xs text-slate-500">
              {detail.replacementAssetTag}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default AssetInfoSection;