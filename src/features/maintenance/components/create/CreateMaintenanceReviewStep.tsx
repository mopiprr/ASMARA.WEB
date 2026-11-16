import { CheckCircle2 } from 'lucide-react';

import type { MaintenanceAssetOption } from '../../types/maintenance.types';

interface CreateMaintenanceReviewStepProps {
  subject: string;
  description: string;
  problemDescription: string;
  asset: MaintenanceAssetOption | undefined;
}

// STEP 2: ringkasan sebelum submit.
function CreateMaintenanceReviewStep({
  subject,
  description,
  problemDescription,
  asset,
}: CreateMaintenanceReviewStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Request Information
        </span>

        <h3 className="mt-1 text-base font-bold text-slate-800">
          {subject}
        </h3>

        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
          {description.trim() ? description : (
            <span className="italic text-slate-400">No additional description provided.</span>
          )}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50/90 px-5 py-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Asset & Problem
          </h4>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400">Asset</p>
            <p className="mt-1 font-semibold text-slate-800">
              {asset ? `${asset.itemName} - ${asset.assetTag}` : '-'}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Category / Ownership</p>
            <p className="mt-1 font-semibold text-slate-800">
              {asset ? `${asset.categoryName} · ${asset.isShared ? 'Company Asset' : 'Personal'}` : '-'}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-xs text-slate-400">Problem Description</p>
            <p className="mt-1 whitespace-pre-wrap text-slate-700">
              {problemDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-blue-600" />
        <div>
          <p className="font-bold">Please Review Carefully Before Submitting</p>
          <p className="mt-1 leading-relaxed text-blue-800">
            Once submitted, the asset status becomes Under Maintenance and your request will be forwarded to your manager for approval.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CreateMaintenanceReviewStep;