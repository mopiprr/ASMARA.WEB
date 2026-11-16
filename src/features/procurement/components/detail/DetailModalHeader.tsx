import { Package, Pencil } from 'lucide-react';

import TicketDetailModalHeader from '../../../../components/common/TicketDetailModalHeader';

interface DetailModalHeaderProps {
  ticketNumber: string;
  isProcessing: boolean;
  onClose: () => void;

  // Tombol "Edit Request" (hanya saat EMPLOYEE_REVISION untuk requester).
  // Ditaruh di header supaya tidak ikut ter-scroll bersama isi modal.
  canEdit: boolean;
  isEditing: boolean;
  onStartEditing: () => void;
}

function DetailModalHeader({
  ticketNumber,
  isProcessing,
  onClose,
  canEdit,
  isEditing,
  onStartEditing,
}: DetailModalHeaderProps) {
  return (
    <TicketDetailModalHeader
      icon={<Package size={22} />}
      iconContainerClassName="bg-blue-50 text-blue-600"
      title="Procurement Details"
      ticketNumber={ticketNumber}
      subtitle={
        isEditing ? (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
            Editing
          </span>
        ) : undefined
      }
      actions={
        canEdit && !isEditing ? (
          <button
            type="button"
            onClick={onStartEditing}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
          >
            <Pencil size={14} />
            Edit Request
          </button>
        ) : undefined
      }
      onClose={onClose}
      closeDisabled={isProcessing}
    />
  );
}

export default DetailModalHeader;
