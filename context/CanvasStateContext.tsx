import React from 'react';
import { DEFAULT_AUDIO_TRACKS, DEFAULT_CONTENT_TRACKS, LIBRARY_ASSETS, TIMELINE_DURATION } from '../constants';
import type {
  AssetType,
  AudioClip,
  AudioTrack,
  CanvasAsset,
  ContentClip,
  ContentTrack,
  LibraryAsset,
  SelectedEntity,
  TimelineMode,
  Transform,
} from '../types';

const CANVAS_STAGE_SIZE = { width: 100, height: 100 };

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2, 9)}`;

const cloneAudioTracks = (tracks: AudioTrack[]): AudioTrack[] =>
  tracks.map((track) => ({ ...track, clips: track.clips.map((clip) => ({ ...clip })) }));

const cloneContentTracks = (tracks: ContentTrack[]): ContentTrack[] =>
  tracks.map((track) => ({ ...track, clips: track.clips.map((clip) => ({ ...clip })) }));

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const clampTimelineTime = (value: number) => clamp(value, 0, TIMELINE_DURATION);

interface CanvasStateContextValue {
  assets: CanvasAsset[];
  audioTracks: AudioTrack[];
  contentTracks: ContentTrack[];
  libraryAssets: LibraryAsset[];
  selected: SelectedEntity;
  selectEntity: (entity: SelectedEntity) => void;
  addAssetToCanvas: (
    assetId: string,
    options?: {
      position?: { x: number; y: number };
      size?: { width: number; height: number };
      timeline?: CanvasAsset['timeline'];
    }
  ) => string | null;
  addMusicClip: (assetId: string, options?: { start?: number; trackIndex?: number }) => void;
  addVisualClip: (assetId: string, options?: { start?: number; trackIndex?: number }) => void;
  updateAssetTransform: (assetId: string, updates: Partial<Transform>) => void;
  toggleAssetVisibility: (assetId: string) => void;
  toggleAssetLock: (assetId: string) => void;
  removeEntity: (entity: SelectedEntity) => void;
  reorderAssetZIndex: (assetId: string, direction: 1 | -1) => void;
  updateAudioClip: (clipId: string, updates: Partial<AudioClip>) => void;
  updateContentClip: (clipId: string, updates: Partial<ContentClip>) => void;
  moveAudioClip: (clipId: string, trackIndex: number) => void;
  moveContentClip: (clipId: string, trackIndex: number) => void;
  toggleContentTrackLock: (trackId: string) => void;
  toggleContentTrackVisibility: (trackId: string) => void;
  toggleAudioTrackMute: (trackId: string) => void;
  toggleAudioTrackSolo: (trackId: string) => void;
  toggleAudioTrackLock: (trackId: string) => void;
  timelineDuration: number;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  mode: TimelineMode;
  setMode: (mode: TimelineMode) => void;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
}

const CanvasStateContext = React.createContext<CanvasStateContextValue | undefined>(undefined);

export const CanvasStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = React.useState<CanvasAsset[]>([]);
  const [audioTracks, setAudioTracks] = React.useState<AudioTrack[]>(() =>
    DEFAULT_AUDIO_TRACKS.map((track) => ({ ...track, clips: track.clips.map((clip) => ({ ...clip })) }))
  );
  const [contentTracks, setContentTracks] = React.useState<ContentTrack[]>(() =>
    DEFAULT_CONTENT_TRACKS.map((track) => ({ ...track, clips: track.clips.map((clip) => ({ ...clip })) }))
  );
  const [selected, setSelected] = React.useState<SelectedEntity>(null);
  const [mode, setMode] = React.useState<TimelineMode>('edit');
  const [currentTime, setCurrentTimeState] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);

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

  const setCurrentTime = React.useCallback((time: number) => {
    setCurrentTimeState((prev) => {
      const next = clampTimelineTime(time);
      if (next === prev) {
        return prev;
      }
      return next;
    });
  }, []);

  const addAssetToCanvas = React.useCallback<CanvasStateContextValue['addAssetToCanvas']>(
    (assetId, options = {}) => {
      if (mode !== 'edit') {
        return null;
      }

      const libraryAsset = libraryLookup.get(assetId);
      if (!libraryAsset || libraryAsset.type === 'music') {
        return null;
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

      const newAsset: CanvasAsset = {
        id: createdId,
        assetId: libraryAsset.id,
        name: libraryAsset.name,
        type: libraryAsset.type as Exclude<AssetType, 'music'>,
        mediaUrl: libraryAsset.mediaUrl,
        thumbnailUrl: libraryAsset.thumbnailUrl,
        transform: baseTransform,
        zIndex: assets.length + 1,
        isLocked: false,
        isVisible: true,
        timeline: options.timeline ? { ...options.timeline, clipId: options.timeline.clipId } : undefined,
      };

      setAssets((prev) => [...prev, newAsset]);
      setSelected({ kind: 'canvas', id: createdId });

      return createdId;
    },
    [assets.length, libraryLookup, mode]
  );

  const addMusicClip = React.useCallback<CanvasStateContextValue['addMusicClip']>(
    (assetId, options = {}) => {
      if (mode !== 'edit') {
        return;
      }

      const libraryAsset = libraryLookup.get(assetId);
      if (!libraryAsset || libraryAsset.type !== 'music') {
        return;
      }

      const clipId = createId();

      setAudioTracks((prev) => {
        const tracks = cloneAudioTracks(prev);
        const duration = libraryAsset.duration ?? 120;
        const desiredTrack =
          typeof options.trackIndex === 'number' ? clamp(options.trackIndex, 0, tracks.length - 1) : 0;
        const track = tracks[desiredTrack];

        if (!track || track.locked) {
          return prev;
        }

        const start = clampTimelineTime(options.start ?? currentTime);
        const clip: AudioClip = {
          id: clipId,
          assetId: libraryAsset.id,
          name: libraryAsset.name,
          start,
          duration: Math.max(1, Math.min(duration, TIMELINE_DURATION - start)),
          source: libraryAsset.mediaUrl,
          volume: 0.8,
          fadeIn: 0,
          fadeOut: 0,
        };

        track.clips = [...track.clips, clip];
        tracks[desiredTrack] = { ...track };
        return tracks;
      });

      setSelected({ kind: 'audio', id: clipId });
    },
    [currentTime, libraryLookup, mode]
  );

  const addVisualClip = React.useCallback<CanvasStateContextValue['addVisualClip']>(
    (assetId, options = {}) => {
      if (mode !== 'edit') {
        return;
      }

      const libraryAsset = libraryLookup.get(assetId);
      if (!libraryAsset || libraryAsset.type === 'music') {
        return;
      }

      setContentTracks((prev) => {
        const tracks = cloneContentTracks(prev);
        const desiredTrack =
          typeof options.trackIndex === 'number' ? clamp(options.trackIndex, 0, tracks.length - 1) : 0;
        const track = tracks[desiredTrack];

        if (!track || track.locked) {
          return prev;
        }

        const clipId = createId();
        const start = clampTimelineTime(options.start ?? currentTime);
        const estimatedDuration = libraryAsset.duration ?? 45;
        const duration = Math.max(1, Math.min(estimatedDuration, TIMELINE_DURATION - start));
        const timelineMeta = { start, duration, trackId: track.id, clipId };
        const createdAssetId =
          addAssetToCanvas(assetId, {
            timeline: timelineMeta,
          }) ?? null;

        if (!createdAssetId) {
          return prev;
        }

        const clip: ContentClip = {
          id: clipId,
          assetId: libraryAsset.id,
          canvasAssetId: createdAssetId,
          name: libraryAsset.name,
          start,
          duration,
          type: 'image',
          thumbnailUrl: libraryAsset.thumbnailUrl,
        };

        track.clips = [...track.clips, clip];
        tracks[desiredTrack] = { ...track };
        return tracks;
      });
    },
    [addAssetToCanvas, currentTime, libraryLookup, mode]
  );

  const updateAssetTransform = React.useCallback<CanvasStateContextValue['updateAssetTransform']>(
    (assetId, updates) => {
      if (mode !== 'edit') {
        return;
      }

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
    },
    [mode]
  );

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
    if (mode !== 'edit') {
      return;
    }

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
  }, [mode]);

  const updateAudioClip = React.useCallback<CanvasStateContextValue['updateAudioClip']>((clipId, updates) => {
    if (mode !== 'edit') {
      return;
    }

    setAudioTracks((prev) => {
      const tracks = cloneAudioTracks(prev);

      for (let trackIndex = 0; trackIndex < tracks.length; trackIndex += 1) {
        const track = tracks[trackIndex];
        if (track.locked) {
          continue;
        }
        const clipIndex = track.clips.findIndex((clip) => clip.id === clipId);
        if (clipIndex !== -1) {
          const clip = track.clips[clipIndex];
          const nextClip = {
            ...clip,
            ...updates,
          };

          nextClip.start = clampTimelineTime(nextClip.start);
          nextClip.duration = clampTimelineTime(nextClip.duration);
          nextClip.duration = Math.max(1, Math.min(nextClip.duration, TIMELINE_DURATION - nextClip.start));

          track.clips = track.clips.map((item, index) => (index === clipIndex ? nextClip : item));
          tracks[trackIndex] = { ...track };
          return tracks;
        }
      }

      return prev;
    });
  }, [mode]);

  const moveAudioClip = React.useCallback<CanvasStateContextValue['moveAudioClip']>((clipId, targetTrackIndex) => {
    if (mode !== 'edit') {
      return;
    }

    setAudioTracks((prev) => {
      if (targetTrackIndex < 0 || targetTrackIndex >= prev.length) {
        return prev;
      }

      const tracks = cloneAudioTracks(prev);
      let sourceTrackIndex = -1;
      let clip: AudioClip | null = null;

      for (let trackIndex = 0; trackIndex < tracks.length; trackIndex += 1) {
        const track = tracks[trackIndex];
        const foundIndex = track.clips.findIndex((item) => item.id === clipId);
        if (foundIndex !== -1) {
          if (track.locked) {
            return prev;
          }
          sourceTrackIndex = trackIndex;
          clip = track.clips[foundIndex];
          break;
        }
      }

      if (!clip || sourceTrackIndex === targetTrackIndex) {
        return prev;
      }

      const destinationTrack = tracks[targetTrackIndex];
      if (!destinationTrack || destinationTrack.locked) {
        return prev;
      }

      const sourceTrack = tracks[sourceTrackIndex];
      sourceTrack.clips = sourceTrack.clips.filter((item) => item.id !== clipId);
      tracks[sourceTrackIndex] = { ...sourceTrack };

      destinationTrack.clips = [...destinationTrack.clips, clip].sort((a, b) => a.start - b.start);
      tracks[targetTrackIndex] = { ...destinationTrack };

      return tracks;
    });
  }, [mode]);

  const updateContentClip = React.useCallback<CanvasStateContextValue['updateContentClip']>((clipId, updates) => {
    if (mode !== 'edit') {
      return;
    }

    let assetUpdate: { assetId: string; start: number; duration: number; trackId: string } | null = null;

    setContentTracks((prev) => {
      const tracks = cloneContentTracks(prev);

      for (let trackIndex = 0; trackIndex < tracks.length; trackIndex += 1) {
        const track = tracks[trackIndex];
        if (track.locked) {
          continue;
        }
        const clipIndex = track.clips.findIndex((clip) => clip.id === clipId);
        if (clipIndex !== -1) {
          const clip = track.clips[clipIndex];
          const nextClip: ContentClip = {
            ...clip,
            ...updates,
          };

          nextClip.start = clampTimelineTime(nextClip.start);
          nextClip.duration = Math.max(1, Math.min(nextClip.duration, TIMELINE_DURATION - nextClip.start));

          track.clips = track.clips.map((item, index) => (index === clipIndex ? nextClip : item));
          tracks[trackIndex] = { ...track };

          assetUpdate = {
            assetId: nextClip.canvasAssetId,
            start: nextClip.start,
            duration: nextClip.duration,
            trackId: track.id,
          };
          return tracks;
        }
      }

      return prev;
    });

    if (assetUpdate) {
      setAssets((prev) =>
        prev.map((asset) =>
          asset.id === assetUpdate?.assetId
            ? {
                ...asset,
                timeline: asset.timeline
                  ? {
                      ...asset.timeline,
                      start: assetUpdate.start,
                      duration: assetUpdate.duration,
                      trackId: assetUpdate.trackId,
                    }
                  : {
                      start: assetUpdate.start,
                      duration: assetUpdate.duration,
                      trackId: assetUpdate.trackId,
                      clipId: clipId,
                    },
              }
            : asset
        )
      );
    }
  }, [mode]);

  const moveContentClip = React.useCallback<CanvasStateContextValue['moveContentClip']>((clipId, targetTrackIndex) => {
    if (mode !== 'edit') {
      return;
    }

    let assetUpdate: { assetId: string; trackId: string; start: number; duration: number } | null = null;

    setContentTracks((prev) => {
      if (targetTrackIndex < 0 || targetTrackIndex >= prev.length) {
        return prev;
      }

      const tracks = cloneContentTracks(prev);
      let sourceTrackIndex = -1;
      let clip: ContentClip | null = null;

      for (let trackIndex = 0; trackIndex < tracks.length; trackIndex += 1) {
        const track = tracks[trackIndex];
        const foundIndex = track.clips.findIndex((item) => item.id === clipId);
        if (foundIndex !== -1) {
          if (track.locked) {
            return prev;
          }
          sourceTrackIndex = trackIndex;
          clip = track.clips[foundIndex];
          break;
        }
      }

      if (!clip || sourceTrackIndex === targetTrackIndex) {
        return prev;
      }

      const destinationTrack = tracks[targetTrackIndex];
      if (!destinationTrack || destinationTrack.locked) {
        return prev;
      }

      const sourceTrack = tracks[sourceTrackIndex];
      sourceTrack.clips = sourceTrack.clips.filter((item) => item.id !== clipId);
      tracks[sourceTrackIndex] = { ...sourceTrack };

      destinationTrack.clips = [...destinationTrack.clips, clip].sort((a, b) => a.start - b.start);
      tracks[targetTrackIndex] = { ...destinationTrack };

      assetUpdate = {
        assetId: clip.canvasAssetId,
        trackId: destinationTrack.id,
        start: clip.start,
        duration: clip.duration,
      };

      return tracks;
    });

    if (assetUpdate) {
      setAssets((prev) =>
        prev.map((asset) =>
          asset.id === assetUpdate?.assetId
            ? {
                ...asset,
                timeline: asset.timeline
                  ? {
                      ...asset.timeline,
                      trackId: assetUpdate.trackId,
                      start: assetUpdate.start,
                      duration: assetUpdate.duration,
                    }
                  : {
                      start: assetUpdate.start,
                      duration: assetUpdate.duration,
                      trackId: assetUpdate.trackId,
                      clipId,
                    },
              }
            : asset
        )
      );
    }
  }, [mode]);

  const toggleContentTrackLock = React.useCallback<CanvasStateContextValue['toggleContentTrackLock']>((trackId) => {
    setContentTracks((prev) =>
      prev.map((track) =>
        track.id === trackId
          ? {
              ...track,
              locked: !track.locked,
            }
          : track
      )
    );
  }, []);

  const toggleContentTrackVisibility = React.useCallback<CanvasStateContextValue['toggleContentTrackVisibility']>((trackId) => {
    setContentTracks((prev) =>
      prev.map((track) =>
        track.id === trackId
          ? {
              ...track,
              hidden: !track.hidden,
            }
          : track
      )
    );
  }, []);

  const toggleAudioTrackMute = React.useCallback<CanvasStateContextValue['toggleAudioTrackMute']>((trackId) => {
    setAudioTracks((prev) =>
      prev.map((track) =>
        track.id === trackId
          ? {
              ...track,
              muted: !track.muted,
            }
          : track
      )
    );
  }, []);

  const toggleAudioTrackSolo = React.useCallback<CanvasStateContextValue['toggleAudioTrackSolo']>((trackId) => {
    setAudioTracks((prev) =>
      prev.map((track) =>
        track.id === trackId
          ? {
              ...track,
              solo: !track.solo,
            }
          : track
      )
    );
  }, []);

  const toggleAudioTrackLock = React.useCallback<CanvasStateContextValue['toggleAudioTrackLock']>((trackId) => {
    setAudioTracks((prev) =>
      prev.map((track) =>
        track.id === trackId
          ? {
              ...track,
              locked: !track.locked,
            }
          : track
      )
    );
  }, []);

  const removeEntity = React.useCallback<CanvasStateContextValue['removeEntity']>((entity) => {
    if (!entity || mode !== 'edit') {
      return;
    }

    if (entity.kind === 'canvas') {
      let clipIdToRemove: string | null = null;
      setAssets((prev) => {
        const target = prev.find((asset) => asset.id === entity.id);
        clipIdToRemove = target?.timeline?.clipId ?? null;
        return prev.filter((asset) => asset.id !== entity.id);
      });

      if (clipIdToRemove) {
        const removeId = clipIdToRemove;
        setContentTracks((prev) =>
          prev.map((track) => ({
            ...track,
            clips: track.clips.filter((clip) => clip.id !== removeId),
          }))
        );
      }
    } else if (entity.kind === 'audio') {
      setAudioTracks((prev) =>
        prev.map((track) => ({
          ...track,
          clips: track.clips.filter((clip) => clip.id !== entity.id),
        }))
      );
    }

    setSelected(null);
  }, [mode]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selected && mode === 'edit') {
        event.preventDefault();
        removeEntity(selected);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [removeEntity, selected, mode]);

  React.useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    let frameId: number;
    let last = performance.now();

    const step = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      setCurrentTimeState((prev) => {
        const next = clampTimelineTime(prev + delta);
        if (next >= TIMELINE_DURATION) {
          setIsPlaying(false);
          return TIMELINE_DURATION;
        }
        return next;
      });
      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  React.useEffect(() => {
    if (mode === 'edit' && isPlaying) {
      setIsPlaying(false);
    }
  }, [mode, isPlaying]);

  const play = React.useCallback(() => {
    if (currentTime >= TIMELINE_DURATION) {
      setCurrentTimeState(0);
    }
    setMode('play');
    setIsPlaying(true);
  }, [currentTime]);

  const pause = React.useCallback(() => {
    setIsPlaying(false);
  }, []);

  const value = React.useMemo<CanvasStateContextValue>(
    () => ({
      assets,
      audioTracks,
      contentTracks,
      libraryAssets: LIBRARY_ASSETS,
      selected,
      selectEntity,
      addAssetToCanvas,
      addMusicClip,
      addVisualClip,
      updateAssetTransform,
      toggleAssetVisibility,
      toggleAssetLock,
      removeEntity,
      reorderAssetZIndex,
      updateAudioClip,
      updateContentClip,
      moveAudioClip,
      moveContentClip,
      toggleContentTrackLock,
      toggleContentTrackVisibility,
      toggleAudioTrackMute,
      toggleAudioTrackSolo,
      toggleAudioTrackLock,
      timelineDuration: TIMELINE_DURATION,
      currentTime,
      setCurrentTime,
      mode,
      setMode,
      isPlaying,
      play,
      pause,
    }),
    [
      assets,
      audioTracks,
      contentTracks,
      selected,
      selectEntity,
      addAssetToCanvas,
      addMusicClip,
      addVisualClip,
      updateAssetTransform,
      toggleAssetVisibility,
      toggleAssetLock,
      removeEntity,
      reorderAssetZIndex,
      updateAudioClip,
      updateContentClip,
      moveAudioClip,
      moveContentClip,
      toggleContentTrackLock,
      toggleContentTrackVisibility,
      toggleAudioTrackMute,
      toggleAudioTrackSolo,
      toggleAudioTrackLock,
      currentTime,
      setCurrentTime,
      mode,
      setMode,
      isPlaying,
      play,
      pause,
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
