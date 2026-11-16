import type { ProcurementDetail } from '../../types/procurement.types';

import { formatIDR } from '../../utils/procurement.utils';

interface ItemsTableProps {
  items: ProcurementDetail[];
}

// Daftar item (mode lihat).
function ItemsTable({ items }: ItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
        No procurement items found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3 text-center">Quantity</th>
            <th className="px-4 py-3 text-right">Price</th>
            <th className="px-4 py-3 text-right">Subtotal</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {items.map((item, index) => (
            <tr key={`${item.itemId}-${index}`}>
              <td className="px-4 py-3 font-medium text-slate-800">
                {item.itemName}
              </td>

              <td className="px-4 py-3 text-slate-600">
                {item.categoryName}
              </td>

              <td className="px-4 py-3 text-center text-slate-600">
                {item.quantity}
              </td>

              <td className="px-4 py-3 text-right text-slate-600">
                {formatIDR(item.price)}
              </td>

              <td className="px-4 py-3 text-right font-semibold text-slate-800">
                {formatIDR(item.totalPrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ItemsTable;