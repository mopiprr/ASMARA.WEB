import TicketStatusBadge from '../../../components/common/TicketStatusBadge';

interface MaintenanceStatusBadgeProps {
  step: string;
  label?: string;
}

function MaintenanceStatusBadge({ step, label }: MaintenanceStatusBadgeProps) {
  return <TicketStatusBadge step={step} label={label} />;
}

export default MaintenanceStatusBadge;
