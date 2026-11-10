import { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import AccessDenied from '../../../components/common/AccessDenied';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { hasAnyRole } from '../../../utils/auth';
import { INVENTORY_ACCESS_ROLES } from '../utils/inventory.utils';
import type { InventoryItem } from '../types/inventory.types';
import InventoryHeader from '../components/InventoryHeader';
import InventoryStatistics from '../components/InventoryStatistics';
import InventoryTable from '../components/InventoryTable';
import InventoryDetailModal from '../components/InventoryDetailModal';
import InventoryItemModal from '../components/InventoryItemModal';

export function InventoryPage() {
  // Cek role dulu: kalau tidak berhak, API tidak dipanggil sama sekali.
  const canAccess = hasAnyRole(INVENTORY_ACCESS_ROLES);

  const {
    categories,
    filteredItems,
    summary,
    isLoading,
    isForbidden,
    error,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    stockStatus,
    setStockStatus,
    resetFilters,
    hasActiveFilters,
    refetch,
    createItem,
    updateItem,
    deleteItem,
  } = useInventory(canAccess);

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Form Modal State (Create / Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<'create' | 'edit'>('create');
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  const handleOpenCreateModal = () => {
    setItemToEdit(null);
    setFormModalMode('create');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (item: InventoryItem) => {
    setItemToEdit(item);
    setFormModalMode('edit');
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (data: {
    itemCategoryId: number;
    itemName: string;
    stock: number;
    isActive?: boolean;
  }) => {
    setIsSubmitting(true);
    try {
      if (formModalMode === 'create') {
        await createItem({
          itemCategoryId: data.itemCategoryId,
          itemName: data.itemName,
          initialStock: data.stock,
        });
      } else if (itemToEdit) {
        await updateItem(itemToEdit.id, {
          itemName: data.itemName,
          itemCategoryId: data.itemCategoryId,
          newStock: data.stock,
          isActive: data.isActive,
        });
      }
      setIsFormModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      setDeleteErrorMessage(null);
      await deleteItem(itemToDelete.id);
      setItemToDelete(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDeleteErrorMessage(err.message);
      } else {
        setDeleteErrorMessage('Gagal menonaktifkan barang inventaris.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Role tidak cocok, atau backend menolak (403) -> Access denied.
  if (!canAccess || isForbidden) {
    return <AccessDenied message="Only the Inventory department can access this page." />;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <InventoryHeader
        isLoading={isLoading}
        onRefresh={() => void refetch()}
        onAddItem={handleOpenCreateModal}
      />

      {/* SUMMARY STATS METRICS */}
      <InventoryStatistics
        summary={summary}
        activeStockFilter={stockStatus}
        onSelectFilter={setStockStatus}
      />

      {/* INVENTORY TABLE & FILTERS */}
      <InventoryTable
        items={filteredItems}
        categories={categories}
        isLoading={isLoading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        stockStatus={stockStatus}
        onStockStatusChange={setStockStatus}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
        onViewItem={setSelectedItem}
        onEditItem={handleOpenEditModal}
        onDeleteItem={(item) => {
          setDeleteErrorMessage(null);
          setItemToDelete(item);
        }}
        onRetry={() => void refetch()}
      />

      {/* DETAIL MODAL */}
      {selectedItem && (
        <InventoryDetailModal
          item={selectedItem}
          categories={categories}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* CREATE & EDIT FORM MODAL */}
      {isFormModalOpen && (
        <InventoryItemModal
          isOpen={isFormModalOpen}
          mode={formModalMode}
          item={itemToEdit}
          categories={categories}
          isLoading={isSubmitting}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* DELETE / DEACTIVATE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        title="Nonaktifkan Barang Inventaris"
        message={
          deleteErrorMessage
            ? `Peringatan: ${deleteErrorMessage}`
            : `Apakah Anda yakin ingin menonaktifkan "${itemToDelete?.itemName}"?`
        }
        description={
          deleteErrorMessage
            ? 'Operasi dibatalkan oleh sistem karena aturan integritas data aset.'
            : `Barang dengan kode ${itemToDelete?.itemCode} akan dinonaktifkan dari katalog dan tidak dapat dipilih untuk pengadaan baru. Pastikan tidak ada unit yang sedang dipakai oleh karyawan.`
        }
        type="danger"
        confirmText={deleteErrorMessage ? 'Tutup' : 'Ya, Nonaktifkan'}
        cancelText="Batal"
        isLoading={isDeleting}
        onConfirm={
          deleteErrorMessage
            ? () => setItemToDelete(null)
            : handleConfirmDelete
        }
        onCancel={() => {
          setDeleteErrorMessage(null);
          setItemToDelete(null);
        }}
      />
    </div>
  );
}

export default InventoryPage;
