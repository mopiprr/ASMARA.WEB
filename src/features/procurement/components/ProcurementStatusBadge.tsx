
import {
  getStatusLabel,
  getStatusStyle,
} from '../utils/procurement.utils';

interface ProcurementStatusBadgeProps {
  status: string;
}

function ProcurementStatusBadge({
  status,
}: ProcurementStatusBadgeProps) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(status)}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

export default ProcurementStatusBadge;
