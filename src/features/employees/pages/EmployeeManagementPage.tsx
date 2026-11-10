import { useState } from 'react';

import { UserPlus } from 'lucide-react';

import EmployeeTable from '../components/EmployeeTable';
import EmployeeDetailModal from '../components/EmployeeDetailModal';
import EmployeeFormModal from '../components/EmployeeFormModal';
import AccessDenied from '../../../components/common/AccessDenied';

import { hasAnyRole } from '../../../utils/auth';
import { ROLE_ADMIN } from '../utils/employee.utils';

import { useEmployees } from '../hooks/useEmployees';
import { useEmployeeForm } from '../hooks/useEmployeeForm';

function EmployeeManagementPage() {
  const canAccess = hasAnyRole([ROLE_ADMIN]);

  const {
    employees,
    isLoading,
    error,
    isForbidden,
    fetchEmployees,

    searchInput,
    setSearchInput,
    hasFilter,

    status,
    changeStatus,

    sortBy,
    desc,
    toggleSort,

    page,
    totalCount,
    totalPages,
    goToPage,
  } = useEmployees(canAccess);

  // Detail (view)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Form create
  const [isFormOpen, setIsFormOpen] = useState(false);

  const form = useEmployeeForm({
    onSuccess: async (employee) => {
      setIsFormOpen(false);
      await fetchEmployees();

      // Langsung tampilkan detail employee yang baru dibuat.
      setSelectedEmployeeId(employee.id);
    },
  });

  const handleOpenForm = () => {
    form.resetForm();
    setIsFormOpen(true);

    // Dropdown baru diambil saat form dibuka (sekali saja).
    void form.loadOptions();
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    form.resetForm();
  };

  // Halaman khusus Admin (backend juga menolak non-admin dengan 403).
  if (!canAccess || isForbidden) {
    return <AccessDenied message="Only administrators can manage employees." />;
  }

  return (
    <div className="space-y-8">

      {/* PAGE HEADING */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Management
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Employee Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage employees and their login accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <UserPlus size={18} />
          New Employee
        </button>
      </section>

      {/* EMPLOYEE LIST */}
      <EmployeeTable
        employees={employees}
        isLoading={isLoading}
        error={error}
        onRefresh={fetchEmployees}
        onView={(employee) => setSelectedEmployeeId(employee.id)}

        searchInput={searchInput}
        onSearchChange={setSearchInput}
        hasFilter={hasFilter}

        status={status}
        onStatusChange={changeStatus}

        sortBy={sortBy}
        desc={desc}
        onSort={toggleSort}

        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={goToPage}
      />

      {/* DETAIL */}
      <EmployeeDetailModal
        employeeId={selectedEmployeeId}
        onClose={() => setSelectedEmployeeId(null)}
      />

      {/* CREATE */}
      <EmployeeFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        form={form}
      />
    </div>
  );
}

export default EmployeeManagementPage;