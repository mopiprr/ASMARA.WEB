import AssetTable from '../components/AssetTable';
import AssetStatisticsCards from '../components/AssetStatisticsCards';
import AccessDenied from '../../../components/common/AccessDenied';

import { hasAnyRole } from '../../../utils/auth';
import { ASSET_ACCESS_ROLES } from '../utils/asset.utils';
import { useAssets } from '../hooks/useAssets';
import { useAssetStatistics } from '../hooks/useAssetStatistics';

function AssetManagementPage() {
  const canAccess = hasAnyRole(ASSET_ACCESS_ROLES);

  const {
    assets,
    isLoading,
    error,
    isForbidden,
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
  } = useAssets(canAccess);

  const {
    statistics,
    isLoading: isLoadingStatistics,
    fetchStatistics,
  } = useAssetStatistics(canAccess);

  // Refresh tabel sekaligus angka di card.
  const handleRefresh = () => {
    void fetchAssets();
    void fetchStatistics();
  };
  
  if (!canAccess || isForbidden) {
    return <AccessDenied message="Only the Inventory department can access this page." />;
  }
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

      {/* STATISTICS */}
      <AssetStatisticsCards
        statistics={statistics}
        isLoading={isLoadingStatistics}
      />

      {/* ASSET LIST */}
      <AssetTable
        assets={assets}
        isLoading={isLoading}
        error={error}
        onRefresh={handleRefresh}

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