import { useState } from 'react';

import { maintenanceApi } from '../services/maintenanceApi';
import { getApiErrorMessage } from '../utils/maintenance.utils';

interface UseMaintenanceCreateFormOptions {
  onSuccess: () => void | Promise<void>;
}

// State form "New Maintenance Request". Validasi detail dilakukan backend.
export function useMaintenanceCreateForm({ onSuccess }: UseMaintenanceCreateFormOptions) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [assetId, setAssetId] = useState('');
  const [problemDescription, setProblemDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Penjagaan ringan: field wajib belum diisi -> tombol nonaktif.
  const isIncomplete = !subject.trim() || !assetId || !problemDescription.trim();

  const resetForm = () => {
    setSubject('');
    setDescription('');
    setAssetId('');
    setProblemDescription('');
    setSubmitError('');
  };

  const submit = async (): Promise<boolean> => {
    if (isIncomplete) return false;

    try {
      setIsSubmitting(true);
      setSubmitError('');

      await maintenanceApi.create({
        subject: subject.trim(),
        description: description.trim() || null,
        assetId: Number(assetId),
        problemDescription: problemDescription.trim(),
      });

      await onSuccess();
      resetForm();

      return true;
    } catch (error: unknown) {
      console.error('Failed to create maintenance request:', error);

      setSubmitError(
        getApiErrorMessage(error, 'Failed to submit maintenance request. Please try again.'),
      );

      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    subject,
    setSubject,
    description,
    setDescription,
    assetId,
    setAssetId,
    problemDescription,
    setProblemDescription,
    isIncomplete,
    isSubmitting,
    submitError,
    setSubmitError,
    resetForm,
    submit,
  };
}