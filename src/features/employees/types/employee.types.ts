// ==========================================
// LIST & DETAIL
// ==========================================
export interface EmployeeListItem {
  id: string;
  employeeNumber: string;
  fullName: string;
  email: string;
  departmentName: string;
  managerName: string | null;
  employeeStatus: number;   
  userName: string | null;
  isAccountActive: boolean;
}

export type EmployeeSortField =
  | 'employeeNumber'
  | 'fullName'
  | 'department'
  | 'status';

export interface RoleOption {
  id: number;
  roleCode: string;
  roleName: string;
  description: string | null;
}

export interface EmployeeAccount {
  id: string;
  userName: string;
  isActive: boolean;
  createdAt: string;
  roles: RoleOption[];
}

export interface EmployeeAsset {
  id: number;
  assetTag: string;
  itemName: string;
  status: number;
}

export interface EmployeeDetail {
  id: string;
  employeeNumber: string;
  fullName: string;
  email: string;
  departmentId: string;
  departmentName: string;
  managerId: string | null;
  managerName: string | null;
  employeeStatus: number;
  hireDate: string;
  createdAt: string;
  terminatedAt: string | null;
  subordinateCount: number;
  account: EmployeeAccount | null;
  assets: EmployeeAsset[];
}

// ==========================================
// FORM CREATE
// ==========================================

export interface DepartmentOption {
  id: string;
  departmentCode: string;
  departmentName: string;
}

export interface ManagerOption {
  id: string;
  employeeNumber: string;
  fullName: string;
  departmentName: string;
}

export interface EmployeeFormValues {
  employeeNumber: string;
  fullName: string;
  email: string;
  departmentId: string;
  managerId: string;     
  hireDate: string;       
  userName: string;
  password: string;
  confirmPassword: string;
  roleIds: number[];
}

export interface CreateEmployeePayload {
  employeeNumber: string;
  fullName: string;
  email: string;
  departmentId: string;
  managerId: string | null;
  hireDate: string;
  userName: string;
  password: string;
  roleIds: number[];
}

export type EmployeeFormErrors = Partial<Record<keyof EmployeeFormValues, string>>;