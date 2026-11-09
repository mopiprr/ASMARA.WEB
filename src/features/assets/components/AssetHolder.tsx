import { Users } from 'lucide-react';

import type { AssetListItem } from '../types/asset.types';

interface AssetHolderProps {
  asset: AssetListItem;
}

// Pemegang asset: nama orang, "Public" kalau dipakai bersama, atau "-".
function AssetHolder({ asset }: AssetHolderProps) {
  if (asset.holderName) {
    return (
      <>
        <p className="font-medium text-slate-700">
          {asset.holderName}
        </p>

        {asset.holderDepartment && (
          <p className="mt-1 text-xs text-slate-400">
            {asset.holderDepartment}
          </p>
        )}
      </>
    );
  }

  if (asset.isPublic) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
        <Users size={13} />
        Public
      </span>
    );
  }

  return <span className="text-slate-400">-</span>;
}

export default AssetHolder;