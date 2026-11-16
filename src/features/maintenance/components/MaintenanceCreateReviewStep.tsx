import { CheckCircle2, Wrench } from 'lucide-react';

import type { MaintenanceAssetOption } from '../types/maintenance.types';

interface MaintenanceCreateReviewStepProps {
  subject: string;
  description: string;
  problemDescription: string;
  asset: MaintenanceAssetOption;
}

/**
 * Step 2 summary view for Maintenance creation before final confirmation.
 */
function MaintenanceCreateReviewStep({
  subject,
  description,
  problemDescription,
  asset,
}: MaintenanceCreateReviewStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* REQUEST INFORMATION */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Request Information
        </span>

        <h3 className="mt-1 text-base font-bold text-slate-800">{subject}</h3>

        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
          {description.trim() ? (
            description
          ) : (
            <span className="italic text-slate-400">
              No additional description provided.
            </span>
          )}
        </p>
      </div>

      {/* ASSET & PROBLEM DETAILS */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-100 text-violet-700">
              <Wrench size={13} />
            </span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Selected Asset & Problem Details
            </h4>
          </div>

          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
              asset.isShared
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
          >
            {asset.isShared ? 'Company Asset' : 'Personal'}
          </span>
        </div>

        <div className="space-y-4 p-5 text-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-400">Item Name</p>
              <p className="mt-1 font-semibold text-slate-800">
                {asset.itemName}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Asset Tag</p>
              <p className="mt-1 font-mono font-medium text-slate-800">
                {asset.assetTag}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Category</p>
              <p className="mt-1 font-medium text-slate-700">
                {asset.categoryName}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400">Problem Description</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {problemDescription}
            </p>
          </div>
        </div>
      </div>

      {/* CONFIRMATION INFORMATIVE ALERT */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-blue-600" />
        <div>
          <p className="font-bold">Please Review Carefully Before Submitting</p>
          <p className="mt-1 leading-relaxed text-blue-800">
            Please double-check the selected asset and problem description
            before submitting. Once submitted, your maintenance request will be
            sent for approval and handler assignment.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MaintenanceCreateReviewStep;
