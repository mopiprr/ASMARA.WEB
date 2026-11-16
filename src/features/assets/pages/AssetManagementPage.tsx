import { useState } from 'react';

import AssetHeader from '../components/AssetHeader';
import AssetTable from '../components/AssetTable';
import AssignAssetModal from '../components/AssignAssetModal';
import AssetStatisticsCards from '../components/AssetStatisticsCards';
import AccessDenied from '../../../components/common/AccessDenied';

import { hasAnyRole } from '../../../utils/auth';
import { ASSET_ACCESS_ROLES } from '../utils/asset.utils';

import { useAssets } from '../hooks/useAssets';
import { useAssetStatistics } from '../hooks/useAssetStatistics';
import { useAssignAsset } from '../hooks/useAssignAsset';

import type { AssetListItem } from '../types/asset.types';

function AssetManagementPage() {
  // Cek role dulu: kalau tidak berhak, API tidak dipanggil sama sekali.
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

  // Assign asset ke employee
  const [assetToAssign, setAssetToAssign] = useState<AssetListItem | null>(null);

  const assignment = useAssignAsset({
    onSuccess: async () => {
      await Promise.all([fetchAssets(), fetchStatistics()]);
    },
  });

  const handleOpenAssign = (asset: AssetListItem) => {
    setAssetToAssign(asset);

    // Daftar employee diambil saat modal pertama kali dibuka.
    void assignment.loadEmployees();
  };

  // Role tidak cocok, atau backend tetap menolak (403) -> Access denied.
  if (!canAccess || isForbidden) {
    return <AccessDenied message="You do not have permission to manage assets." />;
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <AssetHeader
        isLoading={isLoading || isLoadingStatistics}
        onRefresh={handleRefresh}
      />

      {/* STATISTICS (klik untuk filter) */}
      <AssetStatisticsCards
        statistics={statistics}
        isLoading={isLoadingStatistics}
        activeStatus={status}
        onSelectStatus={changeStatus}
      />

      {/* ASSET LIST */}
      <AssetTable
        assets={assets}
        isLoading={isLoading}
        error={error}
        onRefresh={handleRefresh}
        onAssign={handleOpenAssign}

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

      {/* ASSIGN */}
      <AssignAssetModal
        asset={assetToAssign}
        onClose={() => setAssetToAssign(null)}
        assignment={assignment}
      />
    </div>
  );
}

export default AssetManagementPage;