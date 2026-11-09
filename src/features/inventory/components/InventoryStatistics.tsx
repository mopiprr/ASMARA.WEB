import { Package, Boxes, AlertTriangle, AlertOctagon } from 'lucide-react';
import type { InventorySummary, StockStatusFilter } from '../types/inventory.types';

interface InventoryStatisticsProps {
  summary: InventorySummary;
  activeStockFilter: StockStatusFilter;
  onSelectFilter: (filter: StockStatusFilter) => void;
}

export function InventoryStatistics({
  summary,
  activeStockFilter,
  onSelectFilter,
}: InventoryStatisticsProps) {
  const cards = [
    {
      id: 'total_skus' as const,
      filter: 'all' as StockStatusFilter,
      title: 'Total SKU Items',
      value: summary.totalSkus,
      subtitle: 'Total registered items',
      icon: Package,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: activeStockFilter === 'all' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200',
      badge: 'All Items',
      badgeColor: 'bg-blue-50 text-blue-700',
    },
    {
      id: 'total_units' as const,
      filter: 'in_stock' as StockStatusFilter,
      title: 'Units In Stock',
      value: summary.totalUnits,
      subtitle: 'Total physical units on hand',
      icon: Boxes,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: activeStockFilter === 'in_stock' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200',
      badge: 'Available',
      badgeColor: 'bg-emerald-50 text-emerald-700',
    },
    {
      id: 'low_stock' as const,
      filter: 'low_stock' as StockStatusFilter,
      title: 'Low Stock Alert',
      value: summary.lowStockCount,
      subtitle: 'Stock running low (< 5 units)',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: activeStockFilter === 'low_stock' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-200',
      badge: 'Needs Restock',
      badgeColor: 'bg-amber-50 text-amber-700',
    },
    {
      id: 'out_of_stock' as const,
      filter: 'out_of_stock' as StockStatusFilter,
      title: 'Out of Stock',
      value: summary.outOfStockCount,
      subtitle: 'Depleted or zero stock items',
      icon: AlertOctagon,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: activeStockFilter === 'out_of_stock' ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200',
      badge: 'Out of Stock',
      badgeColor: 'bg-rose-50 text-rose-700',
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeStockFilter === card.filter;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => {
              if (isSelected && card.filter !== 'all') {
                onSelectFilter('all');
              } else {
                onSelectFilter(card.filter);
              }
            }}
            className={`flex flex-col text-left rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md cursor-pointer ${card.borderColor}`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-medium text-slate-500">
                {card.title}
              </span>

              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bgColor} ${card.iconColor}`}>
                <Icon size={20} />
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between w-full">
              <span className="text-2xl font-bold tracking-tight text-slate-800">
                {card.value.toLocaleString()}
              </span>

              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${card.badgeColor}`}>
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

export default InventoryStatistics;
