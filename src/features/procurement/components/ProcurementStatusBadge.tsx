import TicketStatusBadge from '../../../components/common/TicketStatusBadge';

interface ProcurementStatusBadgeProps {
  status: string;
}

function ProcurementStatusBadge({ status }: ProcurementStatusBadgeProps) {
  return <TicketStatusBadge step={status} />;
}

export default ProcurementStatusBadge;
