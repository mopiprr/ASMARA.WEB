
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { AlertCircle, LoaderCircle, X } from 'lucide-react';

import type {
  CreateMaintenancePayload,
  MaintenanceAssetOption,
} from '../types/maintenance.types';

interface MaintenanceCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: MaintenanceAssetOption[];
  isLoadingAssets: boolean;
  assetError: string;
  onSubmit: (payload: CreateMaintenancePayload) => Promise<void>;
  onRefreshAssets?: () => void;
}

function MaintenanceCreateModal({
  isOpen,
  onClose,
  assets,
  isLoadingAssets,
  assetError,
  onSubmit,
  onRefreshAssets,
}: MaintenanceCreateModalProps) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [assetId, setAssetId] = useState('');
  const [problemDescription, setProblemDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setSubject('');
    setDescription('');
    setAssetId('');
    setProblemDescription('');
    setSubmitError('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setSubmitError('');

    // Validate subject
    if (!subject.trim()) {
      setSubmitError('Please enter a request subject.');
      return;
    }

    // Validate asset selection
    if (!assetId) {
      setSubmitError('Please select an asset.');
      return;
    }

    const selectedAssetId = Number(assetId);

    if (
      !Number.isInteger(selectedAssetId) ||
      selectedAssetId <= 0
    ) {
      setSubmitError('Please select a valid asset.');
      return;
    }

    // Find selected asset using the backend AssetId property
    const selectedAsset = assets.find(
      (asset) => asset.assetId === selectedAssetId,
    );

    if (!selectedAsset) {
      setSubmitError(
        'Selected asset could not be found. Please refresh the asset list.',
      );
      return;
    }

    // Validate problem description
    if (!problemDescription.trim()) {
      setSubmitError('Please describe the asset problem.');
      return;
    }

    const payload: CreateMaintenancePayload = {
      subject: subject.trim(),
      description: description.trim() || null,
      assetId: selectedAsset.assetId,
      problemDescription: problemDescription.trim(),
    };

    console.log('Selected asset:', selectedAsset);
    console.log('Maintenance payload:', payload);

    try {
      setIsSubmitting(true);

      // Submit only once
      await onSubmit(payload);

      onClose();
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Failed to create maintenance request.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              New Maintenance Request
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Submit an asset maintenance request.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          {/* Submit Error */}
          {submitError && (
            <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={18} className="shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Asset Loading Error */}
          {assetError && (
            <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <span>{assetError}</span>

              {onRefreshAssets && (
                <button
                  type="button"
                  onClick={onRefreshAssets}
                  disabled={isLoadingAssets}
                  className="shrink-0 font-semibold underline disabled:opacity-50"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {/* Subject */}
          <div>
            <label
              htmlFor="maintenance-subject"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Subject <span className="text-red-500">*</span>
            </label>

            <input
              id="maintenance-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              required
              maxLength={50}
              placeholder="Enter request subject"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {subject.length}/50
            </p>
          </div>

          {/* Asset */}
          <div>
            <label
              htmlFor="maintenance-asset"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Asset <span className="text-red-500">*</span>
            </label>

            <select
              id="maintenance-asset"
              name="assetId"
              value={assetId}
              onChange={(event) => {
                setAssetId(event.target.value);
                setSubmitError('');
              }}
              required
              disabled={isLoadingAssets || !!assetError}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
            >
              <option value="">
                {isLoadingAssets
                  ? 'Loading available assets...'
                  : 'Select an asset'}
              </option>

              {assets.map((asset) => (
                <option
                  key={asset.assetId}
                  value={String(asset.assetId)}
                >
                  {asset.itemName} - {asset.assetTag}
                  {' '}({asset.categoryName})
                  {' '}({asset.isShared ? 'Company Asset' : 'Personal'})
                </option>
              ))}
            </select>

            {!isLoadingAssets &&
              !assetError &&
              assets.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  No assets are currently available for maintenance.
                </p>
              )}

            <p className="mt-1 text-xs text-slate-400">
              Only your personal items and company assets assigned to you
              are available.
            </p>
          </div>

          {/* Problem Description */}
          <div>
            <label
              htmlFor="maintenance-problem"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Problem Description{' '}
              <span className="text-red-500">*</span>
            </label>

            <textarea
              id="maintenance-problem"
              value={problemDescription}
              onChange={(event) =>
                setProblemDescription(event.target.value)
              }
              required
              maxLength={500}
              rows={4}
              placeholder="Describe the asset problem in detail..."
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {problemDescription.length}/500
            </p>
          </div>

          {/* Additional Description */}
          <div>
            <label
              htmlFor="maintenance-description"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Additional Description
            </label>

            <textarea
              id="maintenance-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Additional information (optional)"
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {description.length}/500
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                isLoadingAssets ||
                !!assetError ||
                assets.length === 0
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              )}

              {isSubmitting
                ? 'Submitting...'
                : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MaintenanceCreateModal;
