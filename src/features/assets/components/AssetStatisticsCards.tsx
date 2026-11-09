import {
  Package,
  CheckCircle2,
  UserRound,
  AlertCircle,
} from 'lucide-react';

import type { AssetStatistics } from '../types/asset.types';

interface AssetStatisticsCardsProps {
  statistics: AssetStatistics | null;
  isLoading: boolean;
}

function AssetStatisticsCards({
  statistics,
  isLoading,
}: AssetStatisticsCardsProps) {
  const cards = [
    {
      title: 'Total Assets',
      value: statistics?.totalAssets,
      icon: Package,
      style: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Available Assets',
      value: statistics?.available,
      icon: CheckCircle2,
      style: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Assets In Use',
      value: statistics?.inUse,
      icon: UserRound,
      style: 'bg-violet-100 text-violet-600',
    },
    {
      title: 'Under Maintenance',
      value: statistics?.underMaintenance,
      icon: AlertCircle,
      style: 'bg-amber-100 text-amber-600',
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.style}`}
            >
              <Icon size={23} />
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              {item.title}
            </p>

            <h3 className="mt-2 text-3xl font-bold text-slate-800">
              {isLoading && !statistics
                ? '...'
                : item.value !== undefined
                  ? item.value.toLocaleString('en-US')
                  : '-'}
            </h3>
          </div>
        );
      })}
    </section>
  );
}

export default AssetStatisticsCards;