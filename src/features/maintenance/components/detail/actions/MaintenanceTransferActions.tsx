
import {
  CheckCircle,
  LoaderCircle,
  Send,
} from 'lucide-react';

interface MaintenanceTransferActionsProps {
  type: 'receive-parts' | 'send-item' | 'receive-item' | 'close-ticket';
  isProcessing: boolean;
  onClick: () => void;
}

const actionConfig = {
  'receive-parts': {
    label: 'Receive Spare Parts',
    color: 'bg-green-600',
    icon: CheckCircle,
  },
  'send-item': {
    label: 'Send Item',
    color: 'bg-blue-600',
    icon: Send,
  },
  'receive-item': {
    label: 'Receive Item',
    color: 'bg-green-600',
    icon: CheckCircle,
  },
  'close-ticket': {
    label: 'Close Ticket',
    color: 'bg-green-600',
    icon: CheckCircle,
  },
};

export default function MaintenanceTransferActions({
  type,
  isProcessing,
  onClick,
}: MaintenanceTransferActionsProps) {
  const action = actionConfig[type];
  const Icon = action.icon;

  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onClick}
        disabled={isProcessing}
        className={`inline-flex items-center gap-2 rounded-xl ${action.color} px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50`}
      >
        {isProcessing ? (
          <LoaderCircle size={17} className="animate-spin" />
        ) : (
          <Icon size={17} />
        )}
        {action.label}
      </button>
    </div>
  );
}
