import { CheckCircle, ShoppingCart } from 'lucide-react';

interface ReplacementDecisionProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
  isProcessing: boolean;
}

// Inventory: pengganti ada di gudang, atau perlu dibeli.
function ReplacementDecision({ value, onChange, isProcessing }: ReplacementDecisionProps) {
  const choiceClass = (active: boolean, activeClass: string) =>
    `rounded-xl border px-4 py-3 text-sm font-semibold transition ${
      active ? activeClass : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
    }`;

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange(true)}
        disabled={isProcessing}
        className={choiceClass(value === true, 'border-emerald-500 bg-emerald-50 text-emerald-700')}
      >
        <CheckCircle size={17} className="mx-auto mb-1" />
        Replacement Available
      </button>

      <button
        type="button"
        onClick={() => onChange(false)}
        disabled={isProcessing}
        className={choiceClass(value === false, 'border-blue-500 bg-blue-50 text-blue-700')}
      >
        <ShoppingCart size={17} className="mx-auto mb-1" />
        Purchase Replacement
      </button>
    </div>
  );
}

export default ReplacementDecision;