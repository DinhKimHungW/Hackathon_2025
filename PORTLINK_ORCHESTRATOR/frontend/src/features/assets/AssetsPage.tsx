import { useNavigate } from 'react-router-dom';
import { AssetList } from './AssetList';
import type { Asset } from './assetsSlice';

/**
 * Assets Page Component
 * 
 * Wrapper for AssetList with navigation logic
 */
export default function AssetsPage() {
  const navigate = useNavigate();

  const handleEditAsset = (asset: Asset) => {
    // TODO: Navigate to edit page when implemented
    console.log('Edit asset:', asset.id);
    // navigate(`/assets/${asset.id}/edit`);
  };

  const handleViewAsset = (asset: Asset) => {
    // TODO: Navigate to detail page when implemented
    console.log('View asset:', asset.id);
    // navigate(`/assets/${asset.id}`);
  };

  const handleMaintenanceAsset = (asset: Asset) => {
    // TODO: Implement maintenance action
    console.log('Maintenance asset:', asset.id);
  };

  const handleActivateAsset = (asset: Asset) => {
    // TODO: Implement activate action
    console.log('Activate asset:', asset.id);
  };

  const handleDeactivateAsset = (asset: Asset) => {
    // TODO: Implement deactivate action
    console.log('Deactivate asset:', asset.id);
  };

  return (
    <AssetList
      onEditAsset={handleEditAsset}
      onViewAsset={handleViewAsset}
      onMaintenanceAsset={handleMaintenanceAsset}
      onActivateAsset={handleActivateAsset}
      onDeactivateAsset={handleDeactivateAsset}
    />
  );
}
