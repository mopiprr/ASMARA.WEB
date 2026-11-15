import type { ReactNode } from 'react';

interface ActionSectionProps {
  title: string;
  description: string;
  children?: ReactNode;
}

// Kerangka section aksi (sama dengan "Approval Action" di Procurement).
function ActionSection({ title, description, children }: ActionSectionProps) {
  return (
    <section className="border-t border-slate-100 pt-6">
      <h3 className="mb-2 text-sm font-bold text-slate-800">
        {title}
      </h3>

      <p className="mb-4 text-xs text-slate-500">
        {description}
      </p>

      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default ActionSection;