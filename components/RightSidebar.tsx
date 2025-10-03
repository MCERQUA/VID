
import React from 'react';
import { EyeIcon, LockIcon } from '../constants';
import { useCanvasState } from '../context/CanvasStateContext';
import type { AudioClip, CanvasAsset } from '../types';

type RightSidebarProps = {
  isMobile?: boolean;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

const TABS = ['Properties', 'Effect Controls', 'Essential Sound', 'Lumetri Color'];

const NumberField: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}> = ({ label, value, onChange, min, max, step = 1, suffix }) => (
  <label className="flex flex-col space-y-1 text-xs text-gray-400">
    <span className="uppercase tracking-wide">{label}</span>
    <div className="flex items-center space-x-2">
      <input
        type="number"
        className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={Number.isNaN(value) ? '' : value}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isNaN(next)) {
            onChange(0);
            return;
          }
          onChange(next);
        }}
        min={min}
        max={max}
        step={step}
      />
      {suffix && <span className="text-gray-500 text-xs">{suffix}</span>}
    </div>
  </label>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3">
    <div className="text-xs font-semibold uppercase tracking-wide text-gray-300">{title}</div>
    <div className="space-y-3">{children}</div>
  </div>
);

const useSelectedAudioClip = (
  selectedId: string | null,
  tracks: ReturnType<typeof useCanvasState>['audioTracks']
): { clip: AudioClip; trackId: string } | null => {
  return React.useMemo(() => {
    if (!selectedId) {
      return null;
    }
    for (const track of tracks) {
      const clip = track.clips.find((item) => item.id === selectedId);
      if (clip) {
        return { clip, trackId: track.id };
      }
    }
    return null;
  }, [selectedId, tracks]);
};

const RightSidebar: React.FC<RightSidebarProps> = ({ isMobile = false, onClose, className = '', style }) => {
  const [activeTab, setActiveTab] = React.useState('Properties');
  const {
    assets,
    audioTracks,
    selected,
    updateAssetTransform,
    toggleAssetVisibility,
    toggleAssetLock,
    reorderAssetZIndex,
    removeEntity,
    updateAudioClip,
  } = useCanvasState();

  const selectedAsset: CanvasAsset | null = React.useMemo(() => {
    if (selected?.kind !== 'canvas') {
      return null;
    }
    return assets.find((asset) => asset.id === selected.id) ?? null;
  }, [assets, selected]);

  const selectedClip = useSelectedAudioClip(selected?.kind === 'audio' ? selected.id : null, audioTracks);

  const handleTransformChange = React.useCallback(
    (field: keyof CanvasAsset['transform'], value: number) => {
      if (!selectedAsset) {
        return;
      }
      const updates: Partial<CanvasAsset['transform']> = {};
      const transform = selectedAsset.transform;
      if (field === 'opacity') {
        updates.opacity = clampPercentage(value) / 100;
      } else if (field === 'x') {
        updates.x = clamp(value, 0, 100 - transform.width);
      } else if (field === 'y') {
        updates.y = clamp(value, 0, 100 - transform.height);
      } else if (field === 'width') {
        updates.width = clamp(value, 5, 100 - transform.x);
      } else if (field === 'height') {
        updates.height = clamp(value, 5, 100 - transform.y);
      } else {
        updates[field] = value;
      }
      updateAssetTransform(selectedAsset.id, updates);
    },
    [selectedAsset, updateAssetTransform]
  );

  const handleAudioChange = React.useCallback(
    (field: keyof AudioClip, value: number) => {
      if (!selectedClip) {
        return;
      }
      const updates: Partial<AudioClip> = {};
      if (field === 'volume') {
        updates.volume = clampPercentage(value) / 100;
      } else {
        // @ts-expect-error dynamic assignment
        updates[field] = value;
      }
      updateAudioClip(selectedClip.clip.id, updates);
    },
    [selectedClip, updateAudioClip]
  );

  const containerClasses = `${
    isMobile
      ? 'fixed top-14 bottom-0 right-0 z-40 w-80 max-w-[85vw] shadow-2xl lg:hidden'
      : 'h-full flex-shrink-0'
  } bg-[#252526] border-l border-zinc-700 flex flex-col ${className}`.trim();

  const renderProperties = () => {
    if (!selectedAsset && !selectedClip) {
      return (
        <div className="p-6 text-sm text-gray-400">
          Select an asset on the canvas or a clip in the timeline to edit its properties.
        </div>
      );
    }

    if (selectedAsset) {
      const { transform } = selectedAsset;
      return (
        <div className="p-4 space-y-6">
          <Section title="Layer">
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span>{selectedAsset.name}</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className={`p-1.5 rounded ${selectedAsset.isVisible ? 'text-gray-200' : 'text-red-400'} hover:bg-zinc-700`}
                  onClick={() => toggleAssetVisibility(selectedAsset.id)}
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className={`p-1.5 rounded ${selectedAsset.isLocked ? 'text-blue-400' : 'text-gray-200'} hover:bg-zinc-700`}
                  onClick={() => toggleAssetLock(selectedAsset.id)}
                >
                  <LockIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-xs font-semibold uppercase bg-zinc-700 rounded hover:bg-red-500 hover:text-white"
                  onClick={() => removeEntity({ kind: 'canvas', id: selectedAsset.id })}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <button
                type="button"
                className="flex-1 px-2 py-1 rounded bg-zinc-700 hover:bg-zinc-600"
                onClick={() => reorderAssetZIndex(selectedAsset.id, 1)}
              >
                Bring forward
              </button>
              <button
                type="button"
                className="flex-1 px-2 py-1 rounded bg-zinc-700 hover:bg-zinc-600"
                onClick={() => reorderAssetZIndex(selectedAsset.id, -1)}
              >
                Send back
              </button>
            </div>
          </Section>

          <Section title="Transform">
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Position X"
                value={Math.round(transform.x)}
                onChange={(value) => handleTransformChange('x', clampPercentage(value))}
                min={0}
                max={100}
                suffix="%"
              />
              <NumberField
                label="Position Y"
                value={Math.round(transform.y)}
                onChange={(value) => handleTransformChange('y', clampPercentage(value))}
                min={0}
                max={100}
                suffix="%"
              />
              <NumberField
                label="Width"
                value={Math.round(transform.width)}
                onChange={(value) => handleTransformChange('width', clampPercentage(value))}
                min={5}
                max={100}
                suffix="%"
              />
              <NumberField
                label="Height"
                value={Math.round(transform.height)}
                onChange={(value) => handleTransformChange('height', clampPercentage(value))}
                min={5}
                max={100}
                suffix="%"
              />
              <NumberField
                label="Rotation"
                value={Math.round(transform.rotation)}
                onChange={(value) => handleTransformChange('rotation', value)}
                min={-180}
                max={180}
                suffix="°"
              />
              <NumberField
                label="Opacity"
                value={Math.round(transform.opacity * 100)}
                onChange={(value) => handleTransformChange('opacity', value)}
                min={0}
                max={100}
                suffix="%"
              />
            </div>
          </Section>
        </div>
      );
    }

    if (selectedClip) {
      return (
        <div className="p-4 space-y-6">
          <Section title="Clip">
            <div className="text-sm text-gray-200 flex items-center justify-between">
              <span>{selectedClip.clip.name}</span>
              <span className="text-xs text-gray-400">Track {selectedClip.trackId}</span>
            </div>
            <button
              type="button"
              className="w-full px-3 py-1 text-xs font-semibold uppercase bg-zinc-700 rounded hover:bg-red-500 hover:text-white"
              onClick={() => removeEntity({ kind: 'audio', id: selectedClip.clip.id })}
            >
              Delete clip
            </button>
          </Section>

          <Section title="Timing">
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Start"
                value={Math.round(selectedClip.clip.start)}
                onChange={(value) => handleAudioChange('start', Math.max(0, value))}
                min={0}
                suffix="s"
              />
              <NumberField
                label="Duration"
                value={Math.round(selectedClip.clip.duration)}
                onChange={(value) => handleAudioChange('duration', Math.max(1, value))}
                min={1}
                suffix="s"
              />
            </div>
          </Section>

          <Section title="Audio">
            <NumberField
              label="Volume"
              value={Math.round(selectedClip.clip.volume * 100)}
              onChange={(value) => handleAudioChange('volume', clampPercentage(value))}
              min={0}
              max={200}
              suffix="%"
            />
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Fade in"
                value={selectedClip.clip.fadeIn ?? 0}
                onChange={(value) => handleAudioChange('fadeIn', Math.max(0, value))}
                min={0}
                suffix="s"
              />
              <NumberField
                label="Fade out"
                value={selectedClip.clip.fadeOut ?? 0}
                onChange={(value) => handleAudioChange('fadeOut', Math.max(0, value))}
                min={0}
                suffix="s"
              />
            </div>
          </Section>
        </div>
      );
    }

    return null;
  };

  return (
    <aside className={containerClasses} style={style}>
      <div className="flex items-center border-b border-zinc-700">
        <div className="flex flex-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium flex-1 ${
                activeTab === tab
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:bg-zinc-700/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs font-medium text-gray-300 bg-zinc-800 rounded-l hover:bg-zinc-700"
          >
            Close
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'Properties' ? renderProperties() : (
          <div className="p-4 text-sm text-gray-400">{tabPlaceholderMessage(activeTab)}</div>
        )}
      </div>
    </aside>
  );
};

const clampPercentage = (value: number) => clamp(value, 0, 100);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const tabPlaceholderMessage = (tab: string) =>
  `The ${tab} panel will display contextual controls in a future update.`;

export default RightSidebar;
