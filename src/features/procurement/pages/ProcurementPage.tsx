
import { useEffect, useState, type FormEvent } from 'react';
import {
  Search,
  Plus,
  ClipboardList,
  X,
  Trash2,
  PackagePlus,
  PencilLine,
} from 'lucide-react';

import api from '../../../services/api';

// ==========================================
// INTERFACES
// ==========================================

interface CategoryOption {
  id: number;
  categoryName: string;
}

interface ItemOption {
  id: number;
  itemCategoryId: number;
  itemName: string;
}

interface ProcurementItem {
  categoryId: string;
  itemId: string;
  itemName: string;
  quantity: string;
  estimatedPrice: string;
  isManual: boolean;
}

interface CategoryItemsState {
  [categoryId: string]: ItemOption[];
}

interface LoadingState {
  [categoryId: string]: boolean;
}

interface ErrorState {
  [categoryId: string]: string;
}

// ==========================================
// HELPER
// ==========================================

const createEmptyItem = (): ProcurementItem => ({
  categoryId: '',
  itemId: '',
  itemName: '',
  quantity: '1',
  estimatedPrice: '',
  isManual: false,
});

// ==========================================
// COMPONENT
// ==========================================

function ProcurementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Request information
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  // Procurement items
  const [items, setItems] = useState<ProcurementItem[]>([
    createEmptyItem(),
  ]);

  // Category data
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  // Inventory data, stored separately for each category
  const [inventoryItemsByCategory, setInventoryItemsByCategory] =
    useState<CategoryItemsState>({});

  const [loadingItems, setLoadingItems] = useState<LoadingState>({});
  const [itemErrors, setItemErrors] = useState<ErrorState>({});

  // ==========================================
  // FETCH CATEGORIES
  // ==========================================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        setCategoryError('');

        const response = await api.get<CategoryOption[]>(
          '/inventory/categories'
        );

        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch item categories:', error);
        setCategoryError('Failed to load item categories.');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // ==========================================
  // FETCH INVENTORY ITEMS BY CATEGORY
  // ==========================================

  const fetchInventoryItems = async (categoryId: string) => {
    if (!categoryId) return;

    // Avoid fetching again if this category has already been loaded.
    if (
      Object.prototype.hasOwnProperty.call(
        inventoryItemsByCategory,
        categoryId
      )
    ) {
      return;
    }

    try {
      setLoadingItems((current) => ({
        ...current,
        [categoryId]: true,
      }));

      setItemErrors((current) => ({
        ...current,
        [categoryId]: '',
      }));

      const response = await api.get<ItemOption[]>(
        '/inventory/items',
        {
          params: {
            categoryId,
          },
        }
      );

      setInventoryItemsByCategory((current) => ({
        ...current,
        [categoryId]: response.data,
      }));
    } catch (error) {
      console.error(
        `Failed to fetch inventory items for category ${categoryId}:`,
        error
      );

      setItemErrors((current) => ({
        ...current,
        [categoryId]: 'Failed to load inventory items.',
      }));
    } finally {
      setLoadingItems((current) => ({
        ...current,
        [categoryId]: false,
      }));
    }
  };

  // ==========================================
  // FORM HANDLERS
  // ==========================================

  const resetForm = () => {
    setSubject('');
    setDescription('');
    setItems([createEmptyItem()]);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const updateItem = (
    index: number,
    field: keyof ProcurementItem,
    value: string | boolean
  ) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // ==========================================
  // CATEGORY CHANGE
  // ==========================================

  const handleCategoryChange = (
    index: number,
    categoryId: string
  ) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              categoryId,
              itemId: '',
              itemName: '',
              isManual: false,
            }
          : item
      )
    );

    // Load items belonging to the selected category.
    if (categoryId) {
      fetchInventoryItems(categoryId);
    }
  };

  // ==========================================
  // ITEM CHANGE
  // ==========================================

  const handleItemChange = (
    index: number,
    itemId: string
  ) => {
    const currentItem = items[index];

    const categoryItems =
      inventoryItemsByCategory[currentItem.categoryId] ?? [];

    const selectedItem = categoryItems.find(
      (item) => item.id.toString() === itemId
    );

    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              itemId,
              itemName: selectedItem?.itemName ?? '',
            }
          : item
      )
    );
  };

  // ==========================================
  // MANUAL ITEM
  // ==========================================

  const toggleManualItem = (index: number) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              isManual: !item.isManual,
              itemId: '',
              itemName: '',
            }
          : item
      )
    );
  };

  // ==========================================
  // ADD / REMOVE ITEM
  // ==========================================

  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      createEmptyItem(),
    ]);
  };

  const removeItem = (index: number) => {
    setItems((currentItems) =>
      currentItems.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Procurement submission API will be integrated later.
    console.log('Procurement form:', {
      subject,
      description,
      items,
    });
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Workspace
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Procurement
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage and monitor procurement requests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          New Request
        </button>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Statistics will be added later */}
      </section>

      {/* Procurement Requests */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Procurement Requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View and track procurement requests.
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search requests..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Empty Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">
                  Ticket
                </th>
                <th className="px-6 py-4 font-semibold">
                  Request Details
                </th>
                <th className="px-6 py-4 font-semibold">
                  Requester
                </th>
                <th className="px-6 py-4 font-semibold">
                  Date
                </th>
                <th className="px-6 py-4 font-semibold">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-20 text-center"
                >
                  <ClipboardList
                    size={44}
                    className="mx-auto text-slate-300"
                  />

                  <h3 className="mt-4 text-sm font-semibold text-slate-700">
                    No procurement requests yet
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Procurement requests will appear here.
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-400">
            Showing 0 requests
          </p>
        </div>
      </section>

      {/* New Procurement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  New Procurement Request
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Fill in the information below to create a request.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={21} />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="space-y-7 overflow-y-auto px-6 py-6">

                {/* Request Information */}
                <section className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Request Information
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Provide the general information for this request.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Subject <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter request subject"
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Description
                    </label>

                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the purpose of this procurement request..."
                      rows={3}
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </section>

                <div className="border-t border-slate-100" />

                {/* Item Details */}
                <section className="space-y-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Item Details
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Add the items you want to procure.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addItem}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                    >
                      <Plus size={16} />
                      Add Item
                    </button>
                  </div>

                  {/* Item List */}
                  {items.map((item, index) => {
                    const categoryItems =
                      inventoryItemsByCategory[item.categoryId] ?? [];

                    const isLoadingItem =
                      loadingItems[item.categoryId] ?? false;

                    const currentItemError =
                      itemErrors[item.categoryId] ?? '';

                    return (
                      <div
                        key={index}
                        className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <PackagePlus
                              size={18}
                              className="text-blue-600"
                            />

                            <h4 className="text-sm font-semibold text-slate-700">
                              Item {index + 1}
                            </h4>
                          </div>

                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                              title="Remove item"
                            >
                              <Trash2 size={17} />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                          {/* Item Category */}
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                              Item Category{' '}
                              <span className="text-red-500">*</span>
                            </label>

                            <select
                              value={item.categoryId}
                              onChange={(e) =>
                                handleCategoryChange(
                                  index,
                                  e.target.value
                                )
                              }
                              required
                              disabled={isLoadingCategories}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                            >
                              <option value="">
                                {isLoadingCategories
                                  ? 'Loading categories...'
                                  : 'Select item category'}
                              </option>

                              {categories.map((category) => (
                                <option
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.categoryName}
                                </option>
                              ))}
                            </select>

                            {categoryError && (
                              <p className="mt-1.5 text-xs text-red-500">
                                {categoryError}
                              </p>
                            )}

                            {!isLoadingCategories &&
                              !categoryError &&
                              categories.length === 0 && (
                                <p className="mt-1.5 text-xs text-slate-500">
                                  No active categories available.
                                </p>
                              )}
                          </div>

                          {/* Item Name */}
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                              Item Name{' '}
                              <span className="text-red-500">*</span>
                            </label>

                            {!item.isManual ? (
                              <select
                                value={item.itemId}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    e.target.value
                                  )
                                }
                                disabled={
                                  !item.categoryId || isLoadingItem
                                }
                                required
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                              >
                                <option value="">
                                  {!item.categoryId
                                    ? 'Select category first'
                                    : isLoadingItem
                                      ? 'Loading items...'
                                      : 'Select item name'}
                                </option>

                                {categoryItems.map((inventoryItem) => (
                                  <option
                                    key={inventoryItem.id}
                                    value={inventoryItem.id}
                                  >
                                    {inventoryItem.itemName}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={item.itemName}
                                onChange={(e) =>
                                  updateItem(
                                    index,
                                    'itemName',
                                    e.target.value
                                  )
                                }
                                placeholder="Enter item name manually"
                                required
                                disabled={!item.categoryId}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                              />
                            )}

                            {item.categoryId && currentItemError && (
                              <p className="mt-1.5 text-xs text-red-500">
                                {currentItemError}
                              </p>
                            )}

                            {item.categoryId &&
                              !item.isManual &&
                              !isLoadingItem &&
                              !currentItemError &&
                              categoryItems.length === 0 && (
                                <p className="mt-1.5 text-xs text-slate-500">
                                  No registered items in this category.
                                </p>
                              )}

                            {item.categoryId && (
                              <button
                                type="button"
                                onClick={() => toggleManualItem(index)}
                                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                              >
                                <PencilLine size={13} />

                                {item.isManual
                                  ? 'Choose from registered items'
                                  : 'Item not available? Enter manually'}
                              </button>
                            )}
                          </div>

                          {/* Quantity */}
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                              Quantity{' '}
                              <span className="text-red-500">*</span>
                            </label>

                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  'quantity',
                                  e.target.value
                                )
                              }
                              required
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>

                          {/* Estimated Price */}
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                              Estimated Price
                            </label>

                            <input
                              type="number"
                              min="0"
                              value={item.estimatedPrice}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  'estimatedPrice',
                                  e.target.value
                                )
                              }
                              placeholder="Enter estimated price"
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </section>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProcurementPage;
