
import React from 'react';
import { ASSET_CATEGORIES, ASSET_DRAG_TYPE } from '../constants';
import { useCanvasState } from '../context/CanvasStateContext';
import type { AssetType, LibraryAsset } from '../types';

type LeftSidebarProps = {
  isMobile?: boolean;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

const formatDuration = (seconds?: number) => {
  if (!seconds) {
    return '0:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

const AssetTile: React.FC<{
  asset: LibraryAsset;
  onAdd: (asset: LibraryAsset) => void;
  disabled?: boolean;
}> = ({ asset, onAdd, disabled = false }) => {
  const handleDragStart = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.setData(
        ASSET_DRAG_TYPE,
        JSON.stringify({ assetId: asset.id, type: asset.type })
      );
    },
    [asset.id, asset.type, disabled]
  );

  return (
    <div
      key={asset.id}
      className="group relative rounded-lg overflow-hidden border border-zinc-700/60 bg-zinc-800 shadow hover:shadow-lg transition-shadow"
      draggable={!disabled}
      onDragStart={handleDragStart}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={asset.thumbnailUrl} alt={asset.name} className="object-cover w-full h-full" />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white truncate" title={asset.name}>
            {asset.name}
          </h4>
          {asset.type === 'music' && (
            <span className="text-xs text-blue-300 font-mono">{formatDuration(asset.duration)}</span>
          )}
        </div>
        {asset.type === 'music' && (
          <p className="text-xs text-gray-400">{asset.bpm ? `${asset.bpm} BPM` : 'Loop'}</p>
        )}
        <button
          type="button"
          onClick={() => {
            if (!disabled) {
              onAdd(asset);
            }
          }}
          disabled={disabled}
          className={`w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide rounded-md mt-2 ${
            disabled
              ? 'bg-zinc-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
        >
          {asset.type === 'music' ? 'Add to timeline' : 'Add to canvas'}
        </button>
      </div>
    </div>
  );
};

const LeftSidebar: React.FC<LeftSidebarProps> = ({ isMobile = false, onClose, className = '', style }) => {
  const { libraryAssets, addAssetToCanvas, addMusicClip, mode } = useCanvasState();
  const [activeCategory, setActiveCategory] = React.useState<AssetType>('character');
  const [search, setSearch] = React.useState('');

  const filteredAssets = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return libraryAssets.filter((asset) => {
      if (asset.type !== activeCategory) {
        return false;
      }
      if (!normalizedSearch) {
        return true;
      }
      return asset.name.toLowerCase().includes(normalizedSearch);
    });
  }, [libraryAssets, activeCategory, search]);

  const handleAddAsset = React.useCallback(
    (asset: LibraryAsset) => {
      if (asset.type === 'music') {
        addMusicClip(asset.id);
      } else {
        addAssetToCanvas(asset.id);
      }
    },
    [addAssetToCanvas, addMusicClip]
  );

  const containerClasses = `${
    isMobile
      ? 'fixed top-14 bottom-0 left-0 z-40 w-72 max-w-[85vw] shadow-2xl lg:hidden'
      : 'h-full flex-shrink-0'
  } bg-[#252526] border-r border-zinc-700 flex ${className}`.trim();

  const currentCategory = React.useMemo(
    () => ASSET_CATEGORIES.find((category) => category.type === activeCategory)?.name ?? 'Assets',
    [activeCategory],
  );

  return (
    <aside className={containerClasses} style={style}>
      <nav className="w-16 h-full bg-[#1f2021] border-r border-zinc-800/70 flex flex-col items-center py-4 space-y-3">
        {ASSET_CATEGORIES.map((category) => {
          const isActive = category.type === activeCategory;
          return (
            <button
              key={category.type}
              type="button"
              onClick={() => setActiveCategory(category.type)}
              aria-label={category.name}
              title={category.name}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-400 shadow-inner'
                  : 'bg-transparent text-gray-400 border-transparent hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <category.icon className="w-5 h-5" />
            </button>
          );
        })}
      </nav>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-zinc-700 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wide text-gray-400">Asset Library</span>
              <div className="text-sm font-semibold text-white">{currentCategory}</div>
            </div>
            {isMobile && (
              <button
                type="button"
                onClick={onClose}
                className="px-2 py-1 text-xs font-medium text-gray-300 bg-zinc-800 rounded hover:bg-zinc-700"
              >
                Close
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${activeCategory}s`}
              className="w-full py-2 pl-10 pr-3 text-sm bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredAssets.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-12">No assets match your search.</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredAssets.map((asset) => (
                <AssetTile
                  key={asset.id}
                  asset={asset}
                  onAdd={handleAddAsset}
                  disabled={mode !== 'edit'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;
