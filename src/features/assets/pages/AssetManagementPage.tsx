import AssetTable from '../components/AssetTable';

import { useAssets } from '../hooks/useAssets';

function AssetManagementPage() {
  const {
    assets,
    isLoading,
    error,
    fetchAssets,

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
  } = useAssets();

  return (
    <div className="space-y-8">

      {/* PAGE HEADING */}
      <section>
        <p className="text-sm font-medium text-blue-600">
          Inventory
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          Asset Management
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          List of company assets and who is holding them.
        </p>
      </section>

      {/* ASSET LIST */}
      <AssetTable
        assets={assets}
        isLoading={isLoading}
        error={error}
        onRefresh={fetchAssets}

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
    </div>
  );
}

export default AssetManagementPage;