import { CheckCircle2 } from 'lucide-react';

import type {
  CategoryOption,
  ProcurementItem,
} from '../../types/procurement.types';

import { formatIDR } from '../../utils/procurement.utils';
import { getFormItemSubtotal } from '../../utils/procurementForm.utils';

interface CreateRequestReviewStepProps {
  subject: string;
  description: string;
  items: ProcurementItem[];
  categories: CategoryOption[];
  estimatedTotal: number;
}

// STEP 2: ringkasan sebelum submit.
function CreateRequestReviewStep({
  subject,
  description,
  items,
  categories,
  estimatedTotal,
}: CreateRequestReviewStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* SUMMARY HEADER INFO */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Request Information
        </span>

        <h3 className="mt-1 text-base font-bold text-slate-800">
          {subject}
        </h3>

        <p className="mt-2 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
          {description.trim() ? description : (
            <span className="italic text-slate-400">No additional description provided.</span>
          )}
        </p>
      </div>

      {/* ITEMS PREVIEW TABLE */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-xs font-bold text-blue-700">
              {items.length}
            </span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Requested Items
            </h4>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            Estimated Cost
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[550px] text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 font-semibold">No</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Item Name</th>
                <th className="px-5 py-3 font-semibold text-right">Quantity</th>
                <th className="px-5 py-3 font-semibold text-right">Unit Price</th>
                <th className="px-5 py-3 font-semibold text-right">Subtotal</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {items.map((item, idx) => {
                const cat = categories.find(
                  (c) => String(c.id) === String(item.categoryId)
                );
                const quantity = Number(item.quantity) || 0;
                const price = Number(item.estimatedPrice) || 0;

                return (
                  <tr key={idx} className="transition hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 font-medium text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-slate-700">
                      {cat?.categoryName || '-'}
                    </td>

                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span>{item.itemName}</span>
                        {item.isManual && (
                          <span className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                            Custom Item
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right font-bold text-slate-800">
                      {quantity.toLocaleString('en-US')} units
                    </td>

                    <td className="px-5 py-3.5 text-right font-mono text-slate-600">
                      {formatIDR(price)}
                    </td>

                    <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900">
                      {formatIDR(getFormItemSubtotal(item))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* GRAND TOTAL ROW */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/80 px-5 py-4">
          <div>
            <p className="text-xs font-bold text-slate-800">
              Total Estimated Cost
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Cumulative estimated cost of all requested items
            </p>
          </div>

          <p className="text-lg font-bold text-blue-700 font-mono">
            {formatIDR(estimatedTotal)}
          </p>
        </div>
      </div>

      {/* CONFIRMATION INFORMATIVE ALERT */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-blue-600" />
        <div>
          <p className="font-bold">Please Review Carefully Before Submitting</p>
          <p className="mt-1 text-blue-800 leading-relaxed">
            Please double-check all entered information and items before submitting. Once submitted, your request will be forwarded to your supervisor for review and approval.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CreateRequestReviewStep;