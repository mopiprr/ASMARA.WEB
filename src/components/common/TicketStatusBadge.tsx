interface TicketStatusBadgeProps {
  step: string;
  label?: string;
}

export function formatStepLabel(step: string): string {
  if (!step) {
    return 'Created';
  }

  return step
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ');
}

function getToneClasses(step: string): { pill: string; dot: string } {
  const status = (step || '').toLowerCase();

  if (
    status.includes('completed') ||
    status.includes('closed') ||
    status.includes('approved')
  ) {
    return {
      pill: 'bg-green-50 text-green-700 border-green-200',
      dot: 'bg-green-500',
    };
  }

  if (
    status.includes('reject') ||
    status.includes('cancel') ||
    status.includes('dispose')
  ) {
    return {
      pill: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-500',
    };
  }

  if (
    status.includes('created') ||
    status.includes('review') ||
    status.includes('approval') ||
    status.includes('check') ||
    status.includes('need') ||
    status.includes('revision')
  ) {
    return {
      pill: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
    };
  }

  return {
    pill: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  };
}

function TicketStatusBadge({ step, label }: TicketStatusBadgeProps) {
  const tone = getToneClasses(step);
  const displayLabel = label || formatStepLabel(step);

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {displayLabel}
    </span>
  );
}

export default TicketStatusBadge;
