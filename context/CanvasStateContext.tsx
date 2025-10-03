import React from 'react';
import {
  ASSET_DRAG_TYPE,
  DEFAULT_AUDIO_TRACKS,
  LIBRARY_ASSETS,
  TIMELINE_DURATION,
} from '../constants';
import type {
  AssetType,
  AudioClip,
  AudioTrack,
  CanvasAsset,
  LibraryAsset,
  SelectedEntity,
  Transform,
} from '../types';

const CANVAS_STAGE_SIZE = { width: 100, height: 100 };

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2, 9)}`;

const cloneTracks = (tracks: AudioTrack[]): AudioTrack[] =>
  tracks.map((track) => ({ ...track, clips: track.clips.map((clip) => ({ ...clip })) }));

interface CanvasStateContextValue {
  assets: CanvasAsset[];
  audioTracks: AudioTrack[];
  libraryAssets: LibraryAsset[];
  selected: SelectedEntity;
  selectEntity: (entity: SelectedEntity) => void;
  addAssetToCanvas: (
    assetId: string,
    options?: { position?: { x: number; y: number }; size?: { width: number; height: number } }
  ) => void;
  addMusicClip: (assetId: string, options?: { start?: number; trackIndex?: number }) => void;
  updateAssetTransform: (assetId: string, updates: Partial<Transform>) => void;
  toggleAssetVisibility: (assetId: string) => void;
  toggleAssetLock: (assetId: string) => void;
  removeEntity: (entity: SelectedEntity) => void;
  reorderAssetZIndex: (assetId: string, direction: 1 | -1) => void;
  updateAudioClip: (clipId: string, updates: Partial<AudioClip>) => void;
  timelineDuration: number;
}

const CanvasStateContext = React.createContext<CanvasStateContextValue | undefined>(undefined);

export const CanvasStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = React.useState<CanvasAsset[]>([]);
  const [audioTracks, setAudioTracks] = React.useState<AudioTrack[]>(() =>
    DEFAULT_AUDIO_TRACKS.map((track) => ({ ...track, clips: track.clips.map((clip) => ({ ...clip })) }))
  );
  const [selected, setSelected] = React.useState<SelectedEntity>(null);

  const libraryLookup = React.useMemo(() => {
    const map = new Map<string, LibraryAsset>();
    for (const asset of LIBRARY_ASSETS) {
      map.set(asset.id, asset);
    }
    return map;
  }, []);

  const selectEntity = React.useCallback((entity: SelectedEntity) => {
    setSelected(entity);
  }, []);

  const addAssetToCanvas = React.useCallback<CanvasStateContextValue['addAssetToCanvas']>(
    (assetId, options = {}) => {
      const libraryAsset = libraryLookup.get(assetId);
      if (!libraryAsset || libraryAsset.type === 'music') {
        return;
      }

      const baseTransform: Transform = {
        x: 25,
        y: 25,
        width: 35,
        height: 35,
        rotation: 0,
        opacity: 1,
        preserveAspectRatio: true,
      };

      if (libraryAsset.type === 'background') {
        baseTransform.x = 0;
        baseTransform.y = 0;
        baseTransform.width = CANVAS_STAGE_SIZE.width;
        baseTransform.height = CANVAS_STAGE_SIZE.height;
        baseTransform.preserveAspectRatio = false;
      }

      if (options.position && libraryAsset.type !== 'background') {
        baseTransform.x = options.position.x;
        baseTransform.y = options.position.y;
      }

      if (options.size && libraryAsset.type !== 'background') {
        baseTransform.width = options.size.width;
        baseTransform.height = options.size.height;
      }

      const createdId = createId();

      setAssets((prev) => [
        ...prev,
        {
          id: createdId,
          assetId: libraryAsset.id,
          name: libraryAsset.name,
          type: libraryAsset.type as Exclude<AssetType, 'music'>,
          mediaUrl: libraryAsset.mediaUrl,
          thumbnailUrl: libraryAsset.thumbnailUrl,
          transform: baseTransform,
          zIndex: prev.length + 1,
          isLocked: false,
          isVisible: true,
        },
      ]);

      setSelected({ kind: 'canvas', id: createdId });
    },
    [libraryLookup]
  );

  const addMusicClip = React.useCallback<CanvasStateContextValue['addMusicClip']>(
    (assetId, options = {}) => {
      const libraryAsset = libraryLookup.get(assetId);
      if (!libraryAsset || libraryAsset.type !== 'music') {
        return;
      }

      const clipId = createId();

      setAudioTracks((prev) => {
        const tracks = cloneTracks(prev);
        const duration = libraryAsset.duration ?? 120;
        const desiredTrack =
          typeof options.trackIndex === 'number' ? options.trackIndex : tracks.findIndex(() => true);
        const trackIndex = desiredTrack >= 0 ? desiredTrack : 0;
        const track = tracks[trackIndex] ?? tracks[0];

        if (!track) {
          return prev;
        }

        const start = Math.max(0, Math.min(options.start ?? 0, TIMELINE_DURATION - 1));
        const clip: AudioClip = {
          id: clipId,
          assetId: libraryAsset.id,
          name: libraryAsset.name,
          start,
          duration: Math.min(duration, TIMELINE_DURATION - start),
          source: libraryAsset.mediaUrl,
          volume: 0.8,
          fadeIn: 0,
          fadeOut: 0,
        };

        track.clips.push(clip);
        tracks[trackIndex] = { ...track, clips: [...track.clips] };
        return tracks;
      });

      setSelected({ kind: 'audio', id: clipId });
    },
    [libraryLookup]
  );

  const updateAssetTransform = React.useCallback<CanvasStateContextValue['updateAssetTransform']>((assetId, updates) => {
    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              transform: {
                ...asset.transform,
                ...updates,
              },
            }
          : asset
      )
    );
  }, []);

  const toggleAssetVisibility = React.useCallback<CanvasStateContextValue['toggleAssetVisibility']>((assetId) => {
    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              isVisible: !asset.isVisible,
            }
          : asset
      )
    );
  }, []);

  const toggleAssetLock = React.useCallback<CanvasStateContextValue['toggleAssetLock']>((assetId) => {
    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              isLocked: !asset.isLocked,
            }
          : asset
      )
    );
  }, []);

  const reorderAssetZIndex = React.useCallback<CanvasStateContextValue['reorderAssetZIndex']>((assetId, direction) => {
    setAssets((prev) => {
      const next = [...prev];
      const index = next.findIndex((asset) => asset.id === assetId);
      if (index === -1) {
        return prev;
      }

      const swapIndex = index + direction;
      if (swapIndex < 0 || swapIndex >= next.length) {
        return prev;
      }

      const temp = next[index];
      next[index] = next[swapIndex];
      next[swapIndex] = temp;

      return next.map((asset, idx) => ({ ...asset, zIndex: idx + 1 }));
    });
  }, []);

  const updateAudioClip = React.useCallback<CanvasStateContextValue['updateAudioClip']>((clipId, updates) => {
    setAudioTracks((prev) => {
      const tracks = cloneTracks(prev);

      for (let trackIndex = 0; trackIndex < tracks.length; trackIndex += 1) {
        const track = tracks[trackIndex];
        const clipIndex = track.clips.findIndex((clip) => clip.id === clipId);
        if (clipIndex !== -1) {
          const clip = track.clips[clipIndex];
          const nextClip = {
            ...clip,
            ...updates,
          };

          nextClip.start = Math.max(0, Math.min(nextClip.start, TIMELINE_DURATION - 1));
          nextClip.duration = Math.max(1, Math.min(nextClip.duration, TIMELINE_DURATION - nextClip.start));

          track.clips[clipIndex] = nextClip;
          tracks[trackIndex] = { ...track, clips: [...track.clips] };
          return tracks;
        }
      }

      return prev;
    });
  }, []);

  const removeEntity = React.useCallback<CanvasStateContextValue['removeEntity']>((entity) => {
    if (!entity) {
      return;
    }

    if (entity.kind === 'canvas') {
      setAssets((prev) => prev.filter((asset) => asset.id !== entity.id));
    } else if (entity.kind === 'audio') {
      setAudioTracks((prev) => {
        const tracks = cloneTracks(prev);
        for (let trackIndex = 0; trackIndex < tracks.length; trackIndex += 1) {
          const track = tracks[trackIndex];
          const nextClips = track.clips.filter((clip) => clip.id !== entity.id);
          tracks[trackIndex] = { ...track, clips: nextClips };
        }
        return tracks;
      });
    }

    setSelected(null);
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selected) {
        event.preventDefault();
        removeEntity(selected);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [removeEntity, selected]);

  const value = React.useMemo<CanvasStateContextValue>(
    () => ({
      assets,
      audioTracks,
      libraryAssets: LIBRARY_ASSETS,
      selected,
      selectEntity,
      addAssetToCanvas,
      addMusicClip,
      updateAssetTransform,
      toggleAssetVisibility,
      toggleAssetLock,
      removeEntity,
      reorderAssetZIndex,
      updateAudioClip,
      timelineDuration: TIMELINE_DURATION,
    }),
    [
      assets,
      audioTracks,
      selected,
      selectEntity,
      addAssetToCanvas,
      addMusicClip,
      updateAssetTransform,
      toggleAssetVisibility,
      toggleAssetLock,
      removeEntity,
      reorderAssetZIndex,
      updateAudioClip,
    ]
  );

  return <CanvasStateContext.Provider value={value}>{children}</CanvasStateContext.Provider>;
};

export const useCanvasState = (): CanvasStateContextValue => {
  const context = React.useContext(CanvasStateContext);
  if (!context) {
    throw new Error('useCanvasState must be used within a CanvasStateProvider');
  }
  return context;
};

export const useLibraryAsset = (assetId: string): LibraryAsset | undefined => {
  const { libraryAssets } = useCanvasState();
  return React.useMemo(() => libraryAssets.find((asset) => asset.id === assetId), [libraryAssets, assetId]);
};

export { ASSET_DRAG_TYPE };
