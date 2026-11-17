import { hasAnyRole } from '../../../utils/auth';

export const FINANCE_ACCESS_ROLES = ['ROL-04']; // Finance

export function isFinanceUser(): boolean {
  return hasAnyRole(FINANCE_ACCESS_ROLES);
}
