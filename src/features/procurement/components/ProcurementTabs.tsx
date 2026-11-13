import type { LucideIcon } from 'lucide-react';
import { ClipboardList, Clock } from 'lucide-react';

import type { ProcurementTab } from '../types/procurement.types';

interface ProcurementTabsProps {
  activeTab: ProcurementTab;
  onTabChange: (tab: ProcurementTab) => void;
  requestsCount: number;
  pendingCount: number;
}

function TabButton({
  isActive,
  icon: Icon,
  label,
  count,
  onClick,
}: {
  isActive: boolean;
  icon: LucideIcon;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
        isActive
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-800'
      }`}
    >
      <Icon size={17} />

      {label}

      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          isActive
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function ProcurementTabs({
  activeTab,
  onTabChange,
  requestsCount,
  pendingCount,
}: ProcurementTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-200">
      <TabButton
        isActive={activeTab === 'requests'}
        icon={ClipboardList}
        label="My Requests"
        count={requestsCount}
        onClick={() => onTabChange('requests')}
      />

      <TabButton
        isActive={activeTab === 'pending'}
        icon={Clock}
        label="Pending Approval"
        count={pendingCount}
        onClick={() => onTabChange('pending')}
      />
    </div>
  );
}

export default ProcurementTabs;