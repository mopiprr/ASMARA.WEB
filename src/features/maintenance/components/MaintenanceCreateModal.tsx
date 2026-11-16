import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  LoaderCircle,
  Send,
  Wrench,
  X,
} from 'lucide-react';

import ConfirmDialog from '../../../components/common/ConfirmDialog';

import type {
  CreateMaintenancePayload,
  MaintenanceAssetOption,
} from '../types/maintenance.types';

import MaintenanceCreateReviewStep from './MaintenanceCreateReviewStep';

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

  const [isReviewing, setIsReviewing] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setIsReviewing(false);
      setShowConfirmSubmit(false);
      return;
    }

    setSubject('');
    setDescription('');
    setAssetId('');
    setProblemDescription('');
    setIsReviewing(false);
    setShowConfirmSubmit(false);
    setSubmitError('');
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedAssetId = Number(assetId);
  const selectedAsset =
    Number.isInteger(selectedAssetId) && selectedAssetId > 0
      ? assets.find((asset) => asset.assetId === selectedAssetId)
      : undefined;

  const isFormIncomplete =
    !subject.trim() ||
    !assetId ||
    !problemDescription.trim() ||
    isLoadingAssets ||
    Boolean(assetError) ||
    assets.length === 0;

  const validateAndProceedToReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

    if (!subject.trim()) {
      setSubmitError('Please enter a request subject.');
      return;
    }

    if (!assetId) {
      setSubmitError('Please select an asset.');
      return;
    }

    if (!Number.isInteger(selectedAssetId) || selectedAssetId <= 0) {
      setSubmitError('Please select a valid asset.');
      return;
    }

    if (!selectedAsset) {
      setSubmitError(
        'Selected asset could not be found. Please refresh the asset list.',
      );
      return;
    }

    if (!problemDescription.trim()) {
      setSubmitError('Please describe the asset problem.');
      return;
    }

    setIsReviewing(true);
  };

  const executeSubmit = async () => {
    if (!selectedAsset) return;

    const payload: CreateMaintenancePayload = {
      subject: subject.trim(),
      description: description.trim() || null,
      assetId: selectedAsset.assetId,
      problemDescription: problemDescription.trim(),
    };

    try {
      setIsSubmitting(true);
      setSubmitError('');

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
      setShowConfirmSubmit(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-150">
        {/* STICKY HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                isReviewing
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-violet-50 text-violet-600'
              }`}
            >
              {isReviewing ? (
                <ClipboardCheck size={22} />
              ) : (
                <Wrench size={22} />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800">
                  {isReviewing
                    ? 'Review Maintenance Request'
                    : 'New Maintenance Request'}
                </h2>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                    isReviewing
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-violet-200 bg-violet-50 text-violet-700'
                  }`}
                >
                  {isReviewing
                    ? 'Step 2 of 2: Review'
                    : 'Step 1 of 2: Fill Details'}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                {isReviewing
                  ? 'Please review your maintenance request details carefully before submitting.'
                  : 'Submit an asset maintenance request for repair inspection.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM BODY & FOOTER */}
        <form
          onSubmit={
            isReviewing
              ? (event) => event.preventDefault()
              : validateAndProceedToReview
          }
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="space-y-5 overflow-y-auto px-6 py-6">
            {/* Submit Error */}
            {submitError && (
              <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Notice</p>
                  <p className="mt-1 whitespace-pre-line text-xs text-red-600">
                    {submitError}
                  </p>
                </div>
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

            {!isReviewing || !selectedAsset ? (
              <>
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
                    disabled={isLoadingAssets || Boolean(assetError)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  >
                    <option value="">
                      {isLoadingAssets
                        ? 'Loading available assets...'
                        : 'Select an asset'}
                    </option>

                    {assets.map((asset) => (
                      <option key={asset.assetId} value={String(asset.assetId)}>
                        {asset.itemName} - {asset.assetTag} (
                        {asset.categoryName}) (
                        {asset.isShared ? 'Company Asset' : 'Personal'})
                      </option>
                    ))}
                  </select>

                  {!isLoadingAssets && !assetError && assets.length === 0 && (
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
                    Problem Description <span className="text-red-500">*</span>
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
              </>
            ) : (
              <MaintenanceCreateReviewStep
                subject={subject}
                description={description}
                problemDescription={problemDescription}
                asset={selectedAsset}
              />
            )}
          </div>

          {/* STICKY FOOTER */}
          <div className="flex shrink-0 flex-col-reverse justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:items-center">
            {!isReviewing ? (
              <>
                <p className="text-xs text-slate-400">
                  Fields marked with <span className="text-red-500">*</span> are
                  required.
                </p>

                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isFormIncomplete || isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span>Proceed to Review</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsReviewing(false)}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Edit</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowConfirmSubmit(true)}
                    disabled={isSubmitting || isFormIncomplete}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle size={15} className="animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Submit Request</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>

      <ConfirmDialog
        isOpen={showConfirmSubmit}
        title="Submit Maintenance Request"
        message="Are you sure you want to submit this maintenance request?"
        description="Please confirm that the selected asset and problem description are accurate. Once submitted, your request will be sent for review and handling."
        type="info"
        confirmText="Yes, Submit"
        cancelText="Cancel"
        isLoading={isSubmitting}
        onConfirm={() => void executeSubmit()}
        onCancel={() => {
          if (!isSubmitting) {
            setShowConfirmSubmit(false);
          }
        }}
      />
    </div>
  );
}

export default MaintenanceCreateModal;
