import { useEffect, useState } from 'react';

import type { MaintenanceAssetOption } from '../../types/maintenance.types';
import type { useMaintenanceCreateForm } from '../../hooks/useMaintenanceCreateForm';

import { ConfirmDialog } from '../../../../components/common/ConfirmDialog';
import CreateRequestAlerts from '../../../../components/common/RequestAlerts';

import CreateMaintenanceHeader from './CreateMaintenanceHeader';
import CreateMaintenanceFormStep from './CreateMaintenanceFormStep';
import CreateMaintenanceReviewStep from './CreateMaintenanceReviewStep';
import CreateMaintenanceFooter from './CreateMaintenanceFooter';

interface MaintenanceCreateModalProps {
  isOpen: boolean;
  onClose: () => void;

  form: ReturnType<typeof useMaintenanceCreateForm>;

  assets: MaintenanceAssetOption[];
  isLoadingAssets: boolean;
  assetError: string;
  onReloadAssets: () => void;
}

// Modal create Maintenance dua langkah (sama dengan Procurement): isi form -> review -> konfirmasi.
function MaintenanceCreateModal({
  isOpen,
  onClose,
  form,
  assets,
  isLoadingAssets,
  assetError,
  onReloadAssets,
}: MaintenanceCreateModalProps) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsReviewing(false);
      setShowConfirmSubmit(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedAsset = assets.find((asset) => String(asset.assetId) === form.assetId);

  const executeSubmit = async () => {
    try {
      await form.submit();
    } finally {
      setShowConfirmSubmit(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !form.isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-150">
        <CreateMaintenanceHeader
          isReviewing={isReviewing}
          isSubmitting={form.isSubmitting}
          onClose={onClose}
        />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <CreateRequestAlerts
            errorMessage={form.submitError}
            successMessage=""
            parentTicketId={null}
          />

          {!isReviewing ? (
            <CreateMaintenanceFormStep
              subject={form.subject}
              description={form.description}
              assetId={form.assetId}
              problemDescription={form.problemDescription}
              assets={assets}
              isLoadingAssets={isLoadingAssets}
              assetError={assetError}
              onReloadAssets={onReloadAssets}
              isSubmitting={form.isSubmitting}
              onSubjectChange={form.setSubject}
              onDescriptionChange={form.setDescription}
              onAssetChange={form.setAssetId}
              onProblemChange={form.setProblemDescription}
            />
          ) : (
            <CreateMaintenanceReviewStep
              subject={form.subject}
              description={form.description}
              problemDescription={form.problemDescription}
              asset={selectedAsset}
            />
          )}
        </div>

        <CreateMaintenanceFooter
          isReviewing={isReviewing}
          isSubmitting={form.isSubmitting}
          isIncomplete={form.isIncomplete}
          onClose={onClose}
          onProceed={() => setIsReviewing(true)}
          onBackToEdit={() => setIsReviewing(false)}
          onSubmitClick={() => setShowConfirmSubmit(true)}
        />
      </div>

      <ConfirmDialog
        isOpen={showConfirmSubmit}
        title="Submit Maintenance Request"
        message="Are you sure you want to submit this maintenance request?"
        description="Please confirm the selected asset and problem description are correct. Once submitted, your request will be sent for approval."
        type="info"
        confirmText="Yes, Submit"
        cancelText="Cancel"
        isLoading={form.isSubmitting}
        onConfirm={executeSubmit}
        onCancel={() => {
          if (!form.isSubmitting) setShowConfirmSubmit(false);
        }}
      />
    </div>
  );
}

export default MaintenanceCreateModal;