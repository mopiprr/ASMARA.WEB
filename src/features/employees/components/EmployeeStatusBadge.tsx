import { getEmployeeStatus } from '../utils/employee.utils';

interface EmployeeStatusBadgeProps {
  status: number;
}

function EmployeeStatusBadge({ status }: EmployeeStatusBadgeProps) {
  const { label, style } = getEmployeeStatus(status);

  return (
    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${style}`}>
      {label}
    </span>
  );
}

export default EmployeeStatusBadge;