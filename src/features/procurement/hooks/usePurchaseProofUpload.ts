import { useEffect, useState } from 'react';

import { MAX_PROOF_SIZE } from '../utils/procurementDetail.utils';

import type { ProcurementTicket } from '../types/procurement.types';

// File bukti pembelian yang dipilih Purchasing sebelum Receive Goods.
export function usePurchaseProofUpload(ticket: ProcurementTicket | null) {
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [proofError, setProofError] = useState('');

  // Kosongkan setiap kali tiket yang dibuka berganti.
  useEffect(() => {
    if (!ticket) return;

    setProofFile(null);
    setProofError('');
  }, [ticket]);

  // Preview hanya untuk gambar.
  useEffect(() => {
    if (!proofFile || !proofFile.type.startsWith('image/')) {
      setProofPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(proofFile);
    setProofPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [proofFile]);

  const handleProofChange = (file: File | null) => {
    setProofError('');

    if (file && file.size > MAX_PROOF_SIZE) {
      setProofFile(null);
      setProofError('File size must not exceed 5 MB.');
      return;
    }

    setProofFile(file);
  };

  return {
    proofFile,
    setProofFile,
    proofPreviewUrl,
    proofError,
    setProofError,
    handleProofChange,
  };
}