export interface DashboardResponse {
  profile: {
    employeeId: string;
    employeeNumber: string;
    fullName: string;
    email: string;
    departmentName: string | null;
    roles: string[];
  };
  statistics: {
    totalAssets: number;
    available: number;
    inUse: number;
    underMaintenance: number;
    disposed: number;
    archived: number;
  };
  recentAssets: {
    id: number;
    assetTag: string;
    itemName: string;
    employeeName: string | null;
    status: string;
  }[];
  recentTickets: {
    id: string;
    ticketNumber: string;
    subject: string;
    ticketType: string;
    createdAt: string;
  }[];
}

export interface TicketStatisticsResponse {
  totalTickets: number;
  pendingTickets: number;
  inProgressTickets: number;
  completedTickets: number;
}

export type TicketTypeFilter = 'all' | 'maintenance' | 'procurement';

export interface TicketStatisticsParams {
  type?: number;
  startDate?: string;
  endDate?: string;
}
