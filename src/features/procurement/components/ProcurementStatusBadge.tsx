import {
  getStatusLabel,
  getStatusStyle,
  getStatusDot,
} from '../utils/procurement.utils';

interface ProcurementStatusBadgeProps {
  status: string;
}

function ProcurementStatusBadge({
  status,
}: ProcurementStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusStyle(status)}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(status)}`} />
      {getStatusLabel(status)}
    </span>
  );
}

export default ProcurementStatusBadge;
