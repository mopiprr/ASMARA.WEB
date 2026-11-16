import type { RequiredPart } from '../../../types/maintenance.types';

interface RequiredPartsListProps {
  parts: RequiredPart[];
}

// Ringkasan kebutuhan part dari handler (dipakai saat membuat Procurement part).
function RequiredPartsList({ parts }: RequiredPartsListProps) {
  if (parts.length === 0) return null;

  return (
    <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4">
      <p className="mb-2 text-xs font-semibold text-slate-600">
        Spare parts requested by the handler
      </p>

      <ul className="space-y-1.5">
        {parts.map((part, index) => (
          <li key={`${part.itemName}-${index}`} className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-800">
              {index + 1}. {part.itemName}
            </span>
            {part.quantity ? (
              <span className="rounded-md bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">
                Qty: {part.quantity}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RequiredPartsList;