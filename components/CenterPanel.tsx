
import React from 'react';
import { ASSET_DRAG_TYPE } from '../constants';
import { useCanvasState } from '../context/CanvasStateContext';
import type { CanvasAsset, TimelineMode } from '../types';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const stageStyle = {
  aspectRatio: '16 / 9',
};

const CanvasAssetLayer: React.FC<{
  asset: CanvasAsset;
  isSelected: boolean;
  onSelect: () => void;
  onStartMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onStartResize: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onNudge: (deltaX: number, deltaY: number) => void;
  mode: TimelineMode;
  currentTime: number;
  isTrackHidden: boolean;
  zIndex: number;
}> = ({
  asset,
  isSelected,
  onSelect,
  onStartMove,
  onStartResize,
  onNudge,
  mode,
  currentTime,
  isTrackHidden,
  zIndex,
}) => {
  if (!asset.isVisible || isTrackHidden) {
    return null;
  }

  const isTimelineActive = asset.timeline
    ? currentTime >= asset.timeline.start && currentTime < asset.timeline.start + asset.timeline.duration
    : true;

  if (!isTimelineActive) {
    return null;
  }

  const isEditable = mode === 'edit' && !asset.isLocked;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${asset.transform.x}%`,
    top: `${asset.transform.y}%`,
    width: `${asset.transform.width}%`,
    height: `${asset.transform.height}%`,
    transform: `rotate(${asset.transform.rotation}deg)`,
    opacity: asset.transform.opacity,
    zIndex,
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={(event) => {
        if (!isEditable) {
          return;
        }
        (event.currentTarget as HTMLDivElement).focus();
        onSelect();
        onStartMove(event);
      }}
      onKeyDown={(event) => {
        if (!isSelected || !isEditable) {
          return;
        }
        const step = event.shiftKey ? 5 : 1;
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          onNudge(0, -step);
        }
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          onNudge(0, step);
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          onNudge(-step, 0);
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          onNudge(step, 0);
        }
      }}
      style={style}
      className={`group ${isEditable ? 'cursor-move' : 'cursor-default'} focus:outline-none`}
    >
      <img src={asset.mediaUrl} alt={asset.name} className="w-full h-full object-cover rounded shadow" draggable={false} />
      {isSelected && isEditable && (
        <>
          <div className="absolute inset-0 border-2 border-blue-400 rounded pointer-events-none" />
          <button
            type="button"
            aria-label="Resize asset"
            onPointerDown={onStartResize}
            className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path d="M4 12h4v4H6a2 2 0 01-2-2v-2zm6-6h4a2 2 0 012 2v2h-4V6h-2z" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

const CenterPanel: React.FC = () => {
  const {
    assets,
    addAssetToCanvas,
    selectEntity,
    selected,
    updateAssetTransform,
    contentTracks,
    currentTime,
    mode,
  } = useCanvasState();
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [stageRect, setStageRect] = React.useState<DOMRect | null>(null);
  const [interaction, setInteraction] = React.useState<
    | {
        mode: 'move' | 'resize';
        assetId: string;
        pointerId: number;
        startPointer: { x: number; y: number };
        initialTransform: CanvasAsset['transform'];
      }
    | null
  >(null);

  React.useEffect(() => {
    const node = stageRef.current;
    if (!node) {
      return;
    }
    const updateRect = () => setStageRect(node.getBoundingClientRect());
    updateRect();
    const observer = new ResizeObserver(updateRect);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!interaction || mode !== 'edit') {
      if (interaction && mode !== 'edit') {
        setInteraction(null);
      }
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== interaction.pointerId || !stageRect) {
        return;
      }
      const deltaXPercent = ((event.clientX - interaction.startPointer.x) / stageRect.width) * 100;
      const deltaYPercent = ((event.clientY - interaction.startPointer.y) / stageRect.height) * 100;

      if (interaction.mode === 'move') {
        const { initialTransform } = interaction;
        const nextX = clamp(initialTransform.x + deltaXPercent, 0, 100 - initialTransform.width);
        const nextY = clamp(initialTransform.y + deltaYPercent, 0, 100 - initialTransform.height);
        updateAssetTransform(interaction.assetId, { x: nextX, y: nextY });
      } else if (interaction.mode === 'resize') {
        const { initialTransform } = interaction;
        const aspect = initialTransform.width / initialTransform.height || 1;
        let nextWidth = clamp(
          initialTransform.width + deltaXPercent,
          5,
          100 - initialTransform.x
        );
        let nextHeight = clamp(
          initialTransform.height + deltaYPercent,
          5,
          100 - initialTransform.y
        );

        if (initialTransform.preserveAspectRatio) {
          nextHeight = clamp(nextWidth / aspect, 5, 100 - initialTransform.y);
          nextWidth = clamp(nextHeight * aspect, 5, 100 - initialTransform.x);
        }

        updateAssetTransform(interaction.assetId, {
          width: nextWidth,
          height: nextHeight,
        });
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerId === interaction.pointerId) {
        setInteraction(null);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: false });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [interaction, mode, stageRect, updateAssetTransform]);

  const handleDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!stageRect || mode !== 'edit') {
        return;
      }
      const data = event.dataTransfer.getData(ASSET_DRAG_TYPE);
      if (!data) {
        return;
      }
      try {
        const payload = JSON.parse(data) as { assetId: string; type: string };
        if (payload.type === 'music') {
          return;
        }
        const percentX = ((event.clientX - stageRect.left) / stageRect.width) * 100;
        const percentY = ((event.clientY - stageRect.top) / stageRect.height) * 100;
        const defaultSize = { width: 35, height: 35 };
        const position = {
          x: clamp(percentX - defaultSize.width / 2, 0, 100 - defaultSize.width),
          y: clamp(percentY - defaultSize.height / 2, 0, 100 - defaultSize.height),
        };

        addAssetToCanvas(payload.assetId, { position });
      } catch (error) {
        // ignore malformed payloads
      }
    },
    [addAssetToCanvas, mode, stageRect]
  );

  const handleDragOver = React.useCallback((event: React.DragEvent) => {
    if (mode === 'edit' && event.dataTransfer.types.includes(ASSET_DRAG_TYPE)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }
  }, [mode]);

  const selectedCanvasId = selected?.kind === 'canvas' ? selected.id : null;

  const startMove = React.useCallback(
    (asset: CanvasAsset) => (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!stageRect || mode !== 'edit' || asset.isLocked) {
        return;
      }
      event.currentTarget.setPointerCapture?.(event.pointerId);
      selectEntity({ kind: 'canvas', id: asset.id });
      setInteraction({
        mode: 'move',
        assetId: asset.id,
        pointerId: event.pointerId,
        startPointer: { x: event.clientX, y: event.clientY },
        initialTransform: { ...asset.transform },
      });
    },
    [mode, selectEntity, stageRect]
  );

  const startResize = React.useCallback(
    (asset: CanvasAsset) => (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!stageRect || mode !== 'edit' || asset.isLocked) {
        return;
      }
      event.currentTarget.setPointerCapture?.(event.pointerId);
      setInteraction({
        mode: 'resize',
        assetId: asset.id,
        pointerId: event.pointerId,
        startPointer: { x: event.clientX, y: event.clientY },
        initialTransform: { ...asset.transform },
      });
    },
    [mode, stageRect]
  );

  const handleNudge = React.useCallback(
    (asset: CanvasAsset, deltaX: number, deltaY: number) => {
      if (mode !== 'edit' || asset.isLocked) {
        return;
      }
      const nextX = clamp(asset.transform.x + deltaX, 0, 100 - asset.transform.width);
      const nextY = clamp(asset.transform.y + deltaY, 0, 100 - asset.transform.height);
      updateAssetTransform(asset.id, { x: nextX, y: nextY });
    },
    [mode, updateAssetTransform]
  );

  const hiddenTracks = React.useMemo(() => {
    const ids = new Set<string>();
    for (const track of contentTracks) {
      if (track.hidden) {
        ids.add(track.id);
      }
    }
    return ids;
  }, [contentTracks]);

  const { map: trackLayers, totalTracks } = React.useMemo(() => {
    const totalTracksCount = contentTracks.length;
    const map = new Map<string, number>();
    contentTracks.forEach((track, index) => {
      map.set(track.id, totalTracksCount - index);
    });
    return { map, totalTracks: totalTracksCount };
  }, [contentTracks]);

  const getAssetZIndex = React.useCallback(
    (asset: CanvasAsset) => {
      const trackId = asset.timeline?.trackId;
      if (trackId) {
        const layer = trackLayers.get(trackId);
        if (typeof layer === 'number') {
          return layer * 1000 + asset.zIndex;
        }
      }
      return (totalTracks + 1) * 1000 + asset.zIndex;
    },
    [trackLayers, totalTracks]
  );

  return (
    <main className="flex flex-col flex-1 bg-[#2d2d2d] items-center justify-center p-4 overflow-hidden">
      <div className="relative w-full max-w-full max-h-full flex-1 flex items-center justify-center">
        <div
          ref={stageRef}
          className="relative bg-white/90 rounded-lg shadow-2xl overflow-hidden w-full max-w-5xl"
          style={stageStyle}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(45deg, rgba(0,0,0,0.08) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.08) 75%), linear-gradient(45deg, rgba(0,0,0,0.08) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.08) 75%)',
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0,12px 12px',
            }}
          />
          {assets.map((asset) => (
            <CanvasAssetLayer
              key={asset.id}
              asset={asset}
              isSelected={selectedCanvasId === asset.id}
              onSelect={() => selectEntity({ kind: 'canvas', id: asset.id })}
              onStartMove={startMove(asset)}
              onStartResize={startResize(asset)}
              onNudge={(dx, dy) => handleNudge(asset, dx, dy)}
              mode={mode}
              currentTime={currentTime}
              isTrackHidden={asset.timeline ? hiddenTracks.has(asset.timeline.trackId) : false}
              zIndex={getAssetZIndex(asset)}
            />
          ))}
          <div className="absolute inset-0 border border-white/20 pointer-events-none rounded-lg" />
        </div>
      </div>
    </main>
  );
};

export default CenterPanel;
