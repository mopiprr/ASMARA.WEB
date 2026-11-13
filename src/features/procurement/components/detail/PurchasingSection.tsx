import { AlertCircle, Upload } from 'lucide-react';

import NoteField from './NoteField';

interface PurchasingSectionProps {
  note: string;
  isProcessing: boolean;
  onNoteChange: (value: string) => void;

  proofFile: File | null;
  proofPreviewUrl: string | null;
  proofError: string;
  onProofChange: (file: File | null) => void;

  actionError: string;
}

// Purchasing: catatan + upload bukti pembelian (wajib) sebelum Receive Goods.
function PurchasingSection({
  note,
  isProcessing,
  onNoteChange,
  proofFile,
  proofPreviewUrl,
  proofError,
  onProofChange,
  actionError,
}: PurchasingSectionProps) {
  return (
    <section className="border-t border-slate-100 pt-6">
      <h3 className="mb-2 text-sm font-bold text-slate-800">
        Purchasing Action
      </h3>

      <p className="mb-4 text-xs text-slate-500">
        Confirm that all requested items have been purchased.
      </p>

      <NoteField
        id="procurement-purchasing-note"
        label="Note"
        hint="(Optional)"
        placeholder="Write purchasing notes..."
        value={note}
        disabled={isProcessing}
        onChange={onNoteChange}
      />

      {/* ERROR RECEIVE GOODS */}
      {(proofError || actionError) && (
        <div className="mt-4 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
          <AlertCircle
            size={17}
            className="mt-0.5 shrink-0 text-red-500"
          />

          <p className="text-sm text-red-700">
            {proofError || actionError}
          </p>
        </div>
      )}

      {/* BUKTI PEMBELIAN (WAJIB) */}
      <label
        htmlFor="procurement-purchase-proof"
        className="mb-2 mt-4 block text-sm font-medium text-slate-700"
      >
        Purchase Proof
        <span className="ml-0.5 text-red-500">*</span>
        <span className="ml-1 text-xs font-normal text-slate-400">
          (Receipt / invoice, max 5 MB)
        </span>
      </label>

      <label
        htmlFor="procurement-purchase-proof"
        className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-4 transition hover:bg-slate-50 ${
          proofError ? 'border-red-300' : 'border-slate-300'
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Upload size={18} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-700">
            {proofFile ? proofFile.name : 'Choose a file'}
          </p>

          <p className="text-xs text-slate-400">
            {proofFile
              ? `${(proofFile.size / 1024 / 1024).toFixed(2)} MB · click to change`
              : 'Photo, PDF, or any other file'}
          </p>
        </div>
      </label>

      <input
        id="procurement-purchase-proof"
        type="file"
        disabled={isProcessing}
        onChange={(event) =>
          onProofChange(event.target.files?.[0] ?? null)
        }
        className="hidden"
      />

      {proofPreviewUrl && (
        <img
          src={proofPreviewUrl}
          alt="Purchase proof preview"
          className="mt-3 max-h-56 w-full rounded-lg border border-slate-200 bg-slate-50 object-contain"
        />
      )}
    </section>
  );
}

export default PurchasingSection;