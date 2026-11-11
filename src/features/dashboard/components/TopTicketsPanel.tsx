import { ArrowRight, Package, Ticket, Wrench, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { getTopTicketsTitle } from '../utils/dashboard.utils';

import type { StatCategory, TopTicketItem } from '../types/dashboard.types';

interface TopTicketsPanelProps {
  category: StatCategory;
  isApprover: boolean;
  isLoading: boolean;
  error: string;
  totalCount: number;
  procurementTickets: TopTicketItem[];
  maintenanceTickets: TopTicketItem[];
  onClose: () => void;
  onOpenTicket: (ticket: TopTicketItem) => void;
}

// Warna tiap grup (Procurement hijau, Maintenance kuning).
const GROUP_THEME = {
  procurement: {
    iconBox: 'bg-emerald-100 text-emerald-700',
    number: 'text-blue-600',
    cardHover: 'hover:border-blue-300',
    button: 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white',
  },
  maintenance: {
    iconBox: 'bg-amber-100 text-amber-700',
    number: 'text-amber-600',
    cardHover: 'hover:border-amber-300',
    button: 'bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white',
  },
};

function TopTicketGroup({
  title,
  icon: Icon,
  theme,
  tickets,
  emptyText,
  onOpenTicket,
}: {
  title: string;
  icon: LucideIcon;
  theme: (typeof GROUP_THEME)['procurement'];
  tickets: TopTicketItem[];
  emptyText: string;
  onOpenTicket: (ticket: TopTicketItem) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${theme.iconBox}`}>
          <Icon size={15} />
        </div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {title} ({tickets.length})
        </h4>
      </div>

      <div className="mt-3 space-y-2.5">
        {tickets.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400">
            {emptyText}
          </p>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs transition ${theme.cardHover}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs font-bold ${theme.number}`}>
                    {ticket.ticketNumber}
                  </span>
                  {ticket.currentStepName && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {ticket.currentStepName}
                    </span>
                  )}
                </div>
                <p
                  className="mt-1 truncate text-xs font-medium text-slate-700"
                  title={ticket.subject}
                >
                  {ticket.subject}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onOpenTicket(ticket)}
                className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${theme.button}`}
              >
                <span>Detail</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TopTicketsPanel({
  category,
  isApprover,
  isLoading,
  error,
  totalCount,
  procurementTickets,
  maintenanceTickets,
  onClose,
  onOpenTicket,
}: TopTicketsPanelProps) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
            TOP 5
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {getTopTicketsTitle(category, isApprover)}
            </h3>
            <p className="text-xs text-slate-500">
              Dikelompokkan berdasarkan tipe tiket. Klik Detail untuk membuka tiket di halaman terkait.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup daftar tiket"
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            Memuat daftar tiket top 5...
          </div>
        ) : error ? (
          <div className="py-6 text-center text-sm text-red-500">
            {error}
          </div>
        ) : totalCount === 0 ? (
          <div className="py-8 text-center">
            <Ticket size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">
              Tidak ada tiket pada kategori ini
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Saat ini belum ada tiket dalam antrean ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TopTicketGroup
              title="Procurement"
              icon={Package}
              theme={GROUP_THEME.procurement}
              tickets={procurementTickets}
              emptyText="Tidak ada tiket procurement pada kategori ini."
              onOpenTicket={onOpenTicket}
            />

            <TopTicketGroup
              title="Maintenance"
              icon={Wrench}
              theme={GROUP_THEME.maintenance}
              tickets={maintenanceTickets}
              emptyText="Tidak ada tiket maintenance pada kategori ini."
              onOpenTicket={onOpenTicket}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default TopTicketsPanel;