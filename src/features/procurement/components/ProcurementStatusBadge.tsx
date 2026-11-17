interface ProcurementStatusBadgeProps {
  step: string;
  label?: string;
}

// Desain sama dengan MaintenanceStatusBadge: label dari backend (currentStepName).
function ProcurementStatusBadge({
  step,
  label,
}: ProcurementStatusBadgeProps) {
  const normalizedStep = (step || '').toLowerCase();

  const getStyle = () => {
    if (
      normalizedStep.includes('completed') ||
      normalizedStep.includes('closed')
    ) {
      return 'border-green-200 bg-green-50 text-green-700';
    }

    if (
      normalizedStep.includes('reject') ||
      normalizedStep.includes('cancel')
    ) {
      return 'border-red-200 bg-red-50 text-red-700';
    }

    if (
      normalizedStep.includes('review') ||
      normalizedStep.includes('approval') ||
      normalizedStep.includes('revis')
    ) {
      return 'border-amber-200 bg-amber-50 text-amber-700';
    }

    return 'border-blue-200 bg-blue-50 text-blue-700';
  };

  const displayLabel = label || step
    ?.replace(/_/g, ' ')
    || 'Created';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStyle()}`}
    >
      {displayLabel}
    </span>
  );
}

export default ProcurementStatusBadge;