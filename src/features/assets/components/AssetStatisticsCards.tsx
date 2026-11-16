import {
  Package,
  CheckCircle2,
  UserRound,
  Wrench,
} from 'lucide-react';

import type { AssetStatistics } from '../types/asset.types';

interface AssetStatisticsCardsProps {
  statistics: AssetStatistics | null;
  isLoading: boolean;
  activeStatus: string;                       // '' = semua status
  onSelectStatus: (status: string) => void;
}

// Card statistik yang bisa diklik untuk memfilter list (seperti Inventory).
function AssetStatisticsCards({
  statistics,
  isLoading,
  activeStatus,
  onSelectStatus,
}: AssetStatisticsCardsProps) {
  const cards = [
    {
      status: '',
      title: 'Total Assets',
      value: statistics?.totalAssets,
      subtitle: 'All registered assets',
      badge: 'All Assets',
      icon: Package,
      iconStyle: 'bg-blue-50 text-blue-600',
      badgeStyle: 'bg-blue-50 text-blue-700',
      activeStyle: 'border-blue-500 ring-2 ring-blue-100',
    },
    {
      status: '1',
      title: 'Available Assets',
      value: statistics?.available,
      subtitle: 'Ready in warehouse',
      badge: 'Available',
      icon: CheckCircle2,
      iconStyle: 'bg-emerald-50 text-emerald-600',
      badgeStyle: 'bg-emerald-50 text-emerald-700',
      activeStyle: 'border-emerald-500 ring-2 ring-emerald-100',
    },
    {
      status: '2',
      title: 'Assets In Use',
      value: statistics?.inUse,
      subtitle: 'Held by employees or shared',
      badge: 'In Use',
      icon: UserRound,
      iconStyle: 'bg-violet-50 text-violet-600',
      badgeStyle: 'bg-violet-50 text-violet-700',
      activeStyle: 'border-violet-500 ring-2 ring-violet-100',
    },
    {
      status: '3',
      title: 'Under Maintenance',
      value: statistics?.underMaintenance,
      subtitle: 'Currently being repaired',
      badge: 'Maintenance',
      icon: Wrench,
      iconStyle: 'bg-amber-50 text-amber-600',
      badgeStyle: 'bg-amber-50 text-amber-700',
      activeStyle: 'border-amber-500 ring-2 ring-amber-100',
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeStatus === card.status;

        return (
          <button
            key={card.title}
            type="button"
            onClick={() =>
              // Klik card yang sedang aktif -> kembali ke semua status.
              onSelectStatus(isSelected && card.status !== '' ? '' : card.status)
            }
            className={`flex w-full flex-col rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:shadow-md ${
              isSelected ? card.activeStyle : 'border-slate-200'
            }`}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                {card.title}
              </span>

              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconStyle}`}>
                <Icon size={20} />
              </div>
            </div>

            <div className="mt-4 flex w-full items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-slate-800">
                {isLoading && !statistics
                  ? '...'
                  : card.value !== undefined
                    ? card.value.toLocaleString('en-US')
                    : '—'}
              </span>

              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${card.badgeStyle}`}>
                {card.badge}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              {card.subtitle}
            </p>
          </button>
        );
      })}
    </section>
  );
}

export default AssetStatisticsCards;