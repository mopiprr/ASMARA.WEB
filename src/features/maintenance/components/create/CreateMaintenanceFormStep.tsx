import { RefreshCw } from 'lucide-react';

import type { MaintenanceAssetOption } from '../../types/maintenance.types';

const SUBJECT_MAX = 50;
const TEXT_MAX = 500;

const inputClass =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50';

interface CreateMaintenanceFormStepProps {
  subject: string;
  description: string;
  assetId: string;
  problemDescription: string;

  assets: MaintenanceAssetOption[];
  isLoadingAssets: boolean;
  assetError: string;
  onReloadAssets: () => void;

  isSubmitting: boolean;

  onSubjectChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAssetChange: (value: string) => void;
  onProblemChange: (value: string) => void;
}

// STEP 1: pilih asset + jelaskan masalah.
function CreateMaintenanceFormStep({
  subject,
  description,
  assetId,
  problemDescription,
  assets,
  isLoadingAssets,
  assetError,
  onReloadAssets,
  isSubmitting,
  onSubjectChange,
  onDescriptionChange,
  onAssetChange,
  onProblemChange,
}: CreateMaintenanceFormStepProps) {
  return (
    <>
      {/* REQUEST INFORMATION */}
      <section>
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800">
            Request Information
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Provide the basic information for your request.
          </p>
        </div>

        <div>
          <label htmlFor="maintenance-subject" className="mb-2 block text-sm font-semibold text-slate-700">
            Request Subject <span className="text-red-500">*</span>
          </label>

          <input
            id="maintenance-subject"
            type="text"
            value={subject}
            onChange={(event) => onSubjectChange(event.target.value)}
            placeholder="Example: Laptop cannot turn on"
            maxLength={SUBJECT_MAX}
            disabled={isSubmitting}
            className={inputClass}
          />

          <p className="mt-1 text-right text-xs text-slate-400">
            {subject.length}/{SUBJECT_MAX}
          </p>
        </div>
      </section>

      <div className="my-7 border-t border-slate-100" />

      {/* ASSET & PROBLEM */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Asset & Problem
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Select the asset that needs maintenance and describe the problem.
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="maintenance-asset" className="text-sm font-semibold text-slate-700">
              Asset <span className="text-red-500">*</span>
            </label>

            <button
              type="button"
              onClick={onReloadAssets}
              disabled={isLoadingAssets || isSubmitting}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition hover:text-blue-700 disabled:opacity-50"
            >
              <RefreshCw size={12} className={isLoadingAssets ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          <select
            id="maintenance-asset"
            value={assetId}
            onChange={(event) => onAssetChange(event.target.value)}
            disabled={isLoadingAssets || isSubmitting}
            className={`${inputClass} bg-white`}
          >
            <option value="">
              {isLoadingAssets ? 'Loading available assets...' : 'Select an asset'}
            </option>

            {assets.map((asset) => (
              <option key={asset.assetId} value={String(asset.assetId)}>
                {asset.itemName} - {asset.assetTag} ({asset.categoryName}) ({asset.isShared ? 'Company Asset' : 'Personal'})
              </option>
            ))}
          </select>

          {assetError ? (
            <p className="mt-2 whitespace-pre-line text-xs text-red-600">{assetError}</p>
          ) : !isLoadingAssets && assets.length === 0 ? (
            <p className="mt-2 text-xs text-amber-600">
              No assets are currently available for maintenance.
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-400">
              Only your personal assets and shared company assets are listed.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="maintenance-problem" className="mb-2 block text-sm font-semibold text-slate-700">
            Problem Description <span className="text-red-500">*</span>
          </label>

          <textarea
            id="maintenance-problem"
            value={problemDescription}
            onChange={(event) => onProblemChange(event.target.value)}
            maxLength={TEXT_MAX}
            rows={4}
            placeholder="Describe the asset problem in detail..."
            disabled={isSubmitting}
            className={`${inputClass} resize-y`}
          />

          <p className="mt-1 text-right text-xs text-slate-400">
            {problemDescription.length}/{TEXT_MAX}
          </p>
        </div>

        <div>
          <label htmlFor="maintenance-description" className="mb-2 block text-sm font-semibold text-slate-700">
            Additional Description
          </label>

          <textarea
            id="maintenance-description"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            maxLength={TEXT_MAX}
            rows={3}
            placeholder="Additional information (optional)"
            disabled={isSubmitting}
            className={`${inputClass} resize-y`}
          />

          <p className="mt-1 text-right text-xs text-slate-400">
            {description.length}/{TEXT_MAX}
          </p>
        </div>
      </section>
    </>
  );
}

export default CreateMaintenanceFormStep;