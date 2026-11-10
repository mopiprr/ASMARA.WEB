import { useEffect, useState } from 'react';

import {
  Receipt,
  ExternalLink,
  LoaderCircle,
  AlertCircle,
} from 'lucide-react';

import api from '../../../services/api';

interface PurchaseProofSectionProps {
  ticketId: string;
  fileName: string;
}

// Menampilkan bukti pembelian dari Purchasing.
// File diambil lewat API (butuh token), lalu ditampilkan memakai object URL.
function PurchaseProofSection({ ticketId, fileName }: PurchaseProofSectionProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isImage, setIsImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let objectUrl: string | null = null;
    const controller = new AbortController();

    async function fetchProof() {
      try {
        setIsLoading(true);
        setError('');

        const response = await api.get<Blob>(
          `/tickets/${ticketId}/purchase-proof`,
          { responseType: 'blob', signal: controller.signal }
        );

        objectUrl = URL.createObjectURL(response.data);

        const type = response.data.type;
        setIsImage(type.startsWith('image/') && type !== 'image/svg+xml');
        setFileUrl(objectUrl);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;

        console.error('Failed to load purchase proof:', err);
        setError('Failed to load purchase proof.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchProof();

    // Bersihkan object URL saat modal ditutup / tiket berganti.
    return () => {
      controller.abort();

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [ticketId]);

  return (
    <section className="border-t border-slate-100 pt-6">
      <div className="mb-4 flex items-center gap-2">
        <Receipt size={17} className="text-slate-500" />

        <h3 className="text-sm font-bold text-slate-800">
          Purchase Proof
        </h3>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <LoaderCircle size={16} className="animate-spin text-blue-500" />
          Loading purchase proof...
        </div>
      )}

      {!isLoading && error && (
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!isLoading && fileUrl && (
        <div className="rounded-xl border border-slate-200 p-4">
          {isImage && (
            <a href={fileUrl} target="_blank" rel="noreferrer">
              <img
                src={fileUrl}
                alt={fileName}
                className="mb-3 max-h-72 w-full rounded-lg bg-slate-50 object-contain"
              />
            </a>
          )}

          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm font-medium text-slate-700">
              {fileName}
            </p>

            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              download={isImage ? undefined : fileName}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <ExternalLink size={14} />
              {isImage ? 'Open' : 'Download'}
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

export default PurchaseProofSection;