import { useState, useEffect, useMemo } from 'react';
import { X, Package, Boxes, AlertCircle, LoaderCircle, Layers, Check } from 'lucide-react';
import type { InventoryItem, InventoryCategory } from '../types/inventory.types';

interface InventoryItemModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  item?: InventoryItem | null;
  categories: InventoryCategory[];
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: {
    itemCategoryId: number;
    itemName: string;
    stock: number;
    isActive?: boolean;
  }) => Promise<void>;
}

export function InventoryItemModal({
  isOpen,
  mode,
  item,
  categories,
  isLoading = false,
  onClose,
  onSubmit,
}: InventoryItemModalProps) {
  const [itemCategoryId, setItemCategoryId] = useState<number>(0);
  const [itemName, setItemName] = useState('');
  const [stock, setStock] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active categories for selection
  const activeCategories = useMemo(
    () => categories.filter((c) => c.isActive),
    [categories]
  );

  // Initialize or reset form fields
  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    if (mode === 'edit' && item) {
      setItemCategoryId(item.itemCategoryId);
      setItemName(item.itemName);
      setStock(item.totalAssetCount ?? item.qty ?? 0);
      setIsActive(item.isActive);
    } else {
      setItemCategoryId(activeCategories[0]?.id ?? 0);
      setItemName('');
      setStock(0);
      setIsActive(true);
    }
  }, [isOpen, mode, item, activeCategories]);

  // Selected category info
  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === itemCategoryId),
    [categories, itemCategoryId]
  );

  const isNonConsumable = selectedCategory?.trackingType === 2;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!itemCategoryId || itemCategoryId <= 0) {
      setError('Silakan pilih kategori barang.');
      return;
    }

    if (!itemName.trim()) {
      setError('Nama barang tidak boleh kosong.');
      return;
    }

    if (stock < 0) {
      setError('Kuantitas stok tidak boleh bernilai negatif.');
      return;
    }

    try {
      await onSubmit({
        itemCategoryId,
        itemName: itemName.trim(),
        stock: Number(stock),
        isActive: mode === 'edit' ? isActive : true,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan saat memproses data inventaris.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              {isNonConsumable ? <Boxes size={20} /> : <Package size={20} />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {mode === 'create' ? 'Tambah Barang Inventaris Baru' : 'Ubah Data Inventaris'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'create'
                  ? 'Daftarkan SKU baru ke dalam master katalog inventaris'
                  : `Perbarui spesifikasi dan stok untuk ${item?.itemCode || 'barang'}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            title="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* KATEGORI BARANG */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kategori Barang <span className="text-rose-500">*</span>
            </label>
            <select
              value={itemCategoryId}
              onChange={(e) => setItemCategoryId(Number(e.target.value))}
              disabled={isLoading || (mode === 'edit' && item?.trackingType === 2 && (item.totalAssetCount ?? 0) > 0)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 shadow-2xs transition focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:text-slate-500"
            >
              {activeCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.categoryName} ({c.trackingType === 2 ? 'Non-Consumable / Aset' : 'Consumable'})
                </option>
              ))}
            </select>
            {mode === 'edit' && item?.trackingType === 2 && (item.totalAssetCount ?? 0) > 0 && (
              <p className="mt-1 text-[11px] text-slate-400">
                Kategori terkunci karena barang ini sudah memiliki unit aset fisik yang terdaftar.
              </p>
            )}
          </div>

          {/* NAMA BARANG */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Barang <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Contoh: Epson Projector EB-X500, Kertas HVS A4, dsb."
              maxLength={100}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 shadow-2xs transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* JUMLAH STOK */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {mode === 'create' ? 'Stok Awal' : 'Kuantitas Stok Fisik'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-medium text-slate-400">
                {isNonConsumable ? 'Jumlah Unit Aset' : 'Satuan Unit'}
              </span>
            </div>

            <input
              type="number"
              min="0"
              max="1000"
              value={stock}
              onChange={(e) => setStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 shadow-2xs transition focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />

            <p className="mt-1 text-[11px] text-slate-400">
              {mode === 'create'
                ? isNonConsumable
                  ? 'Berapa banyak unit fisik yang akan didaftarkan ke gudang pertama kali.'
                  : 'Jumlah kuantitas barang yang tersedia di gudang.'
                : isNonConsumable
                ? 'Menambah stok akan men-generate aset tag baru. Mengurangi stok hanya dapat mengambil unit yang berstatus Available.'
                : 'Ubah angka kuantitas langsung untuk penyesuaian stok opname.'}
            </p>
          </div>

          {/* DYNAMIC SMART CALLOUT BANNER */}
          {isNonConsumable ? (
            <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900">
              <Boxes size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Otomatisasi Asset Tag (Non-Consumable)</p>
                <p className="mt-0.5 text-blue-700 leading-relaxed text-[11px]">
                  Barang dalam kategori ini bertipe <strong>Non-Consumable (Aset Fisik)</strong>. Sistem akan otomatis men-generate{' '}
                  <strong>{stock} unit Asset Tag unik (AST-XXXXXX)</strong> dengan status <em>Available</em> di gudang dan dapat dipantau di halaman Asset Management.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700">
              <Layers size={18} className="text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Barang Habis Pakai (Consumable)</p>
                <p className="mt-0.5 text-slate-500 leading-relaxed text-[11px]">
                  Barang habis pakai dipantau berdasarkan jumlah total kuantitas unit langsung tanpa penomoran serial aset individual.
                </p>
              </div>
            </div>
          )}

          {/* STATUS AKTIF (EDIT MODE) */}
          {mode === 'edit' && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 bg-slate-50/60">
              <div>
                <span className="text-xs font-bold text-slate-800">Status Katalog</span>
                <p className="text-[11px] text-slate-500">
                  Nonaktifkan jika barang tidak lagi dapat dipilih dalam transaksi pengadaan.
                </p>
              </div>

              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={isLoading}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-hidden" />
              </label>
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <LoaderCircle size={14} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>{mode === 'create' ? 'Tambah Barang' : 'Simpan Perubahan'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InventoryItemModal;
