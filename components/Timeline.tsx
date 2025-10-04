import React from 'react';
import {
  SelectToolIcon,
  RazorToolIcon,
  TextIcon,
  SkipStartIcon,
  StepBackwardIcon,
  PlayIcon,
  StepForwardIcon,
  SkipEndIcon,
  PauseIcon,
  PlusIcon,
  MagnetIcon,
  LinkIcon,
  MicIcon,
  EyeIcon,
  LockIcon,
  ASSET_DRAG_TYPE,
} from '../constants';
import { useCanvasState } from '../context/CanvasStateContext';
import type { AudioClip, ContentClip, TimelineMode } from '../types';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const formatBaseTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

const formatDetailedTime = (seconds: number) => {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const mins = Math.floor(totalMs / 60000)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor((totalMs % 60000) / 1000)
    .toString()
    .padStart(2, '0');
  const ms = (totalMs % 1000).toString().padStart(3, '0');
  return `${mins}:${secs}.${ms}`;
};

const BASE_PIXELS_PER_SECOND = 40;
const MIN_PIXELS_PER_SECOND = 10;
const MAX_PIXELS_PER_SECOND = 160;
const TRACK_PANEL_WIDTH = 192; // Tailwind w-48

const createSeededRandom = (seedString: string) => {
  let seed = 0;
  for (let i = 0; i < seedString.length; i += 1) {
    seed = (seed * 31 + seedString.charCodeAt(i)) >>> 0;
  }

  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
};

const AudioWaveform: React.FC<{ seed: string }> = ({ seed }) => {
  const bars = React.useMemo(() => {
    const random = createSeededRandom(seed);
    return Array.from({ length: 90 }, () => random() * 0.8 + 0.2);
  }, [seed]);

  return (
    <div className="flex items-center h-full w-full">
      {bars.map((height, index) => (
        <div key={index} className="w-px bg-green-400" style={{ height: `${height * 100}%` }} />
      ))}
    </div>
  );
};

const TimelineToolbar: React.FC<{
  isPlaying: boolean;
  onTogglePlay: () => void;
  mode: TimelineMode;
  setMode: (mode: TimelineMode) => void;
  pixelsPerSecond: number;
  onZoomChange: (value: number) => void;
}> = ({ isPlaying, onTogglePlay, mode, setMode, pixelsPerSecond, onZoomChange }) => (
  <div className="h-12 bg-[#2d2d2d] flex items-center justify-between px-4 border-b border-zinc-700 flex-shrink-0">
    <div className="flex items-center space-x-4">
      <button className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-700 rounded" type="button">
        <MagnetIcon className="w-5 h-5" />
      </button>
      <button className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-700 rounded" type="button">
        <LinkIcon className="w-5 h-5" />
      </button>
    </div>
    <div className="flex items-center space-x-2">
      <button className="p-1.5 text-gray-400 hover:text-white" type="button">
        <SkipStartIcon className="w-5 h-5" />
      </button>
      <button className="p-1.5 text-gray-400 hover:text-white" type="button">
        <StepBackwardIcon className="w-5 h-5" />
      </button>
      <button
        className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-500"
        type="button"
        onClick={onTogglePlay}
      >
        {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
      </button>
      <button className="p-1.5 text-gray-400 hover:text-white" type="button">
        <StepForwardIcon className="w-5 h-5" />
      </button>
      <button className="p-1.5 text-gray-400 hover:text-white" type="button">
        <SkipEndIcon className="w-5 h-5" />
      </button>
    </div>
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2 text-xs text-gray-300">
        <span className="uppercase tracking-wide font-semibold">Zoom</span>
        <input
          type="range"
          min={MIN_PIXELS_PER_SECOND}
          max={MAX_PIXELS_PER_SECOND}
          step={5}
          value={pixelsPerSecond}
          onChange={(event) => onZoomChange(Number(event.target.value))}
          className="w-28"
        />
        <span className="w-12 text-right font-mono">{`${Math.round((pixelsPerSecond / BASE_PIXELS_PER_SECOND) * 100)}%`}</span>
      </div>
      <div className="flex items-center bg-zinc-700 rounded-md overflow-hidden text-xs">
        <button
          type="button"
          className={`px-3 py-1.5 font-semibold uppercase tracking-wide ${mode === 'edit' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
          onClick={() => setMode('edit')}
        >
          Edit
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 font-semibold uppercase tracking-wide ${mode === 'play' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
          onClick={() => setMode('play')}
        >
          Play
        </button>
      </div>
      <button className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-700 rounded" type="button">
        <PlusIcon className="w-5 h-5" />
      </button>
    </div>
  </div>
);

const TimelineTools: React.FC = () => (
  <div className="w-12 bg-[#252526] border-r border-zinc-700 flex flex-col items-center py-2 space-y-2 flex-shrink-0">
    <button className="p-2 text-white bg-blue-600 rounded-md" type="button">
      <SelectToolIcon className="w-6 h-6" />
    </button>
    <button className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-zinc-700" type="button">
      <RazorToolIcon className="w-6 h-6" />
    </button>
    <button className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-zinc-700" type="button">
      <TextIcon className="w-6 h-6" />
    </button>
  </div>
);

type DragState = {
  mode: 'move' | 'resize-start' | 'resize-end';
  clipId: string;
  pointerId: number;
  offset: number;
  kind: 'audio' | 'content';
  trackId: string;
};

const useClipDrag = (
  timelineDuration: number,
  contentTracks: ReturnType<typeof useCanvasState>['contentTracks'],
  audioTracks: ReturnType<typeof useCanvasState>['audioTracks'],
  updateContentClip: (clipId: string, updates: Partial<ContentClip> & { trackId?: string }) => void,
  updateAudioClip: (clipId: string, updates: Partial<AudioClip>) => void,
  mode: TimelineMode,
  pixelsPerSecond: number,
  scrollContainerRef: React.RefObject<HTMLDivElement>,
  timelineAreaRef: React.RefObject<HTMLDivElement>
) => {
  const [dragState, setDragState] = React.useState<DragState | null>(null);

  const getTimeFromClientX = React.useCallback(
    (clientX: number) => {
      const contentNode = timelineAreaRef.current;
      const scrollNode = scrollContainerRef.current;
      if (!contentNode || !scrollNode) {
        return 0;
      }

      const rect = contentNode.getBoundingClientRect();
      const scrollLeft = scrollNode.scrollLeft;
      const maxPosition = timelineDuration * pixelsPerSecond;
      const position = clamp(clientX - rect.left + scrollLeft, 0, maxPosition);
      return maxPosition === 0 ? 0 : position / pixelsPerSecond;
    },
    [pixelsPerSecond, scrollContainerRef, timelineAreaRef, timelineDuration]
  );

  const findHoverContentTrack = React.useCallback(
    (clientY: number) => {
      const contentNode = timelineAreaRef.current;
      if (!contentNode) {
        return null;
      }

      const trackElements = contentNode.querySelectorAll<HTMLDivElement>('[data-track-kind="content"]');
      const TOLERANCE = 12;

      for (const element of trackElements) {
        const rect = element.getBoundingClientRect();
        if (clientY >= rect.top - TOLERANCE && clientY <= rect.bottom + TOLERANCE) {
          return {
            id: element.dataset.trackId ?? null,
            locked: element.dataset.trackLocked === 'true',
          };
        }
      }

      return null;
    },
    []
  );

  React.useEffect(() => {
    if (!dragState || mode !== 'edit') {
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== dragState.pointerId) {
        return;
      }
      const pointerTime = getTimeFromClientX(event.clientX);

      if (dragState.kind === 'audio') {
        let target: AudioClip | null = null;
        for (const track of audioTracks) {
          const clip = track.clips.find((item) => item.id === dragState.clipId);
          if (clip) {
            target = clip;
            break;
          }
        }
        if (!target) {
          return;
        }

        if (dragState.mode === 'move') {
          const newStart = clamp(pointerTime - dragState.offset, 0, timelineDuration - target.duration);
          updateAudioClip(target.id, { start: newStart });
        } else if (dragState.mode === 'resize-start') {
          const endTime = target.start + target.duration;
          const newStart = clamp(pointerTime, 0, endTime - 1);
          const newDuration = clamp(endTime - newStart, 1, timelineDuration - newStart);
          updateAudioClip(target.id, { start: newStart, duration: newDuration });
        } else if (dragState.mode === 'resize-end') {
          const newEnd = clamp(pointerTime, target.start + 1, timelineDuration);
          const newDuration = clamp(newEnd - target.start, 1, timelineDuration - target.start);
          updateAudioClip(target.id, { duration: newDuration });
        }
      } else {
        let target: ContentClip | null = null;
        for (const track of contentTracks) {
          const clip = track.clips.find((item) => item.id === dragState.clipId);
          if (clip) {
            target = clip;
            break;
          }
        }
        if (!target) {
          return;
        }

        if (dragState.mode === 'move') {
          const newStart = clamp(pointerTime - dragState.offset, 0, timelineDuration - target.duration);
          updateContentClip(target.id, { start: newStart });

          const hoveredTrack = findHoverContentTrack(event.clientY);
          if (
            hoveredTrack &&
            hoveredTrack.id &&
            hoveredTrack.id !== dragState.trackId &&
            !hoveredTrack.locked
          ) {
            updateContentClip(target.id, { trackId: hoveredTrack.id });
            setDragState((prev) =>
              prev && prev.pointerId === dragState.pointerId
                ? { ...prev, trackId: hoveredTrack.id }
                : prev
            );
          }
        } else if (dragState.mode === 'resize-start') {
          const endTime = target.start + target.duration;
          const newStart = clamp(pointerTime, 0, endTime - 1);
          const newDuration = clamp(endTime - newStart, 1, timelineDuration - newStart);
          updateContentClip(target.id, { start: newStart, duration: newDuration });
        } else if (dragState.mode === 'resize-end') {
          const newEnd = clamp(pointerTime, target.start + 1, timelineDuration);
          const newDuration = clamp(newEnd - target.start, 1, timelineDuration - target.start);
          updateContentClip(target.id, { duration: newDuration });
        }
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerId !== dragState.pointerId) {
        return;
      }

      if (dragState.kind === 'content' && dragState.mode === 'move') {
        const trackElements = timelineAreaRef.current?.querySelectorAll<HTMLDivElement>(
          '[data-track-kind="content"]'
        );
        if (trackElements) {
          let targetTrack: { id: string; locked: boolean } | null = null;
          trackElements.forEach((element) => {
            const rect = element.getBoundingClientRect();
            if (event.clientY >= rect.top && event.clientY <= rect.bottom) {
              const id = element.dataset.trackId;
              const locked = element.dataset.trackLocked === 'true';
              if (id) {
                targetTrack = { id, locked };
              }
            }
          });

          if (targetTrack && !targetTrack.locked && targetTrack.id !== dragState.trackId) {
            updateContentClip(dragState.clipId, { trackId: targetTrack.id });
          }
        }
      }

      setDragState(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [
    audioTracks,
    contentTracks,
    dragState,
    findHoverContentTrack,
    getTimeFromClientX,
    mode,
    timelineDuration,
    updateAudioClip,
    updateContentClip,
  ]);

  React.useEffect(() => {
    if (mode !== 'edit') {
      setDragState(null);
    }
  }, [mode]);

  return { dragState, setDragState, getTimeFromClientX };
};

const TimelineClip: React.FC<{
  clip:
    | (AudioClip & { kind: 'audio' })
    | (ContentClip & { kind: 'content'; thumbnailUrl?: string });
  timelineDuration: number;
  pixelsPerSecond: number;
  isSelected: boolean;
  isDragging: boolean;
  isLocked: boolean;
  mode: TimelineMode;
  onBodyPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onResizeStart: (event: React.PointerEvent<HTMLDivElement>) => void;
  onResizeEnd: (event: React.PointerEvent<HTMLDivElement>) => void;
}> = ({
  clip,
  timelineDuration,
  pixelsPerSecond,
  isSelected,
  isDragging,
  isLocked,
  mode,
  onBodyPointerDown,
  onResizeStart,
  onResizeEnd,
}) => {
  const timelinePixelWidth = Math.max(1, timelineDuration * pixelsPerSecond);
  const rawLeft = clip.start * pixelsPerSecond;
  const safeLeft = clamp(rawLeft, 0, timelinePixelWidth);
  const rawWidth = clip.duration * pixelsPerSecond;
  const maxWidth = Math.max(1, timelinePixelWidth - safeLeft);
  const safeWidth = Math.max(1, Math.min(rawWidth, maxWidth));
  const canInteract = mode === 'edit' && !isLocked;

  const baseClasses =
    clip.kind === 'audio'
      ? 'bg-green-600/80'
      : 'bg-blue-500/80';

  return (
    <div
      className={`absolute h-full flex items-center rounded-md overflow-hidden border border-black/40 transition-[box-shadow,transform] ${
        isSelected ? 'ring-2 ring-blue-400' : ''
      } ${isDragging ? 'shadow-xl scale-[1.01]' : ''}`}
      style={{ left: `${safeLeft}px`, width: `${safeWidth}px`, height: '80%' }}
    >
      <div
        role="presentation"
        className={`w-1.5 h-full bg-white/30 cursor-ew-resize ${!canInteract ? 'cursor-default opacity-30' : ''}`}
        onPointerDown={(event) => {
          if (!canInteract) {
            return;
          }
          onResizeStart(event);
        }}
      />
      <div
        role="button"
        tabIndex={0}
        onPointerDown={(event) => {
          if (!canInteract) {
            return;
          }
          onBodyPointerDown(event);
        }}
        className={`flex-1 h-full cursor-${canInteract ? 'grab' : 'default'} active:cursor-grabbing relative ${baseClasses}`}
      >
        {clip.kind === 'audio' ? (
          <AudioWaveform seed={clip.id} />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-70"
            style={{
              backgroundImage: clip.thumbnailUrl ? `url(${clip.thumbnailUrl})` : undefined,
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-1 left-2 right-2 text-xs text-white font-semibold truncate pointer-events-none">
          {clip.name}
        </div>
      </div>
      <div
        role="presentation"
        className={`w-1.5 h-full bg-white/30 cursor-ew-resize ${!canInteract ? 'cursor-default opacity-30' : ''}`}
        onPointerDown={(event) => {
          if (!canInteract) {
            return;
          }
          onResizeEnd(event);
        }}
      />
    </div>
  );
};

const ContentTrackHeader: React.FC<{
  name: string;
  locked?: boolean;
  hidden?: boolean;
  onToggleLock: () => void;
  onToggleVisibility: () => void;
  disableControls: boolean;
}> = ({ name, locked, hidden, onToggleLock, onToggleVisibility, disableControls }) => (
  <div className="h-20 flex items-center px-3 border-b border-zinc-800 space-x-2">
    <div className="flex-1 flex flex-col justify-center">
      <span className="font-bold text-sm">{name}</span>
      <span className="text-xs text-gray-500">Video track</span>
    </div>
    <button
      type="button"
      className={`p-1 rounded ${hidden ? 'bg-zinc-600 text-yellow-300' : 'bg-zinc-700 text-gray-300'} ${
        disableControls ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-600'
      }`}
      onClick={onToggleVisibility}
      disabled={disableControls}
    >
      <EyeIcon className="w-4 h-4" />
    </button>
    <button
      type="button"
      className={`p-1 rounded ${locked ? 'bg-blue-500 text-white' : 'bg-zinc-700 text-gray-300'} ${
        disableControls ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-600'
      }`}
      onClick={onToggleLock}
      disabled={disableControls}
    >
      <LockIcon className="w-4 h-4" />
    </button>
  </div>
);

const AudioTrackHeader: React.FC<{
  name: string;
  muted?: boolean;
  solo?: boolean;
  locked?: boolean;
  onToggleMute: () => void;
  onToggleSolo: () => void;
  onToggleLock: () => void;
  disableControls: boolean;
}> = ({ name, muted, solo, locked, onToggleMute, onToggleSolo, onToggleLock, disableControls }) => (
  <div className="h-20 flex items-center px-3 border-b border-zinc-800 space-x-2">
    <div className="flex-1 flex flex-col justify-center">
      <span className="font-bold text-sm">{name}</span>
      <span className="text-xs text-gray-500">Audio track</span>
    </div>
    <button
      type="button"
      className={`p-1 rounded w-7 h-7 text-xs font-bold ${muted ? 'bg-yellow-500 text-black' : 'bg-zinc-700 text-gray-300'} ${
        disableControls ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-600'
      }`}
      onClick={onToggleMute}
      disabled={disableControls}
    >
      M
    </button>
    <button
      type="button"
      className={`p-1 rounded w-7 h-7 text-xs font-bold ${solo ? 'bg-green-500 text-black' : 'bg-zinc-700 text-gray-300'} ${
        disableControls ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-600'
      }`}
      onClick={onToggleSolo}
      disabled={disableControls}
    >
      S
    </button>
    <button
      type="button"
      className={`p-1 rounded ${locked ? 'bg-blue-500 text-white' : 'bg-zinc-700 text-gray-300'} ${
        disableControls ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-600'
      }`}
      onClick={onToggleLock}
      disabled={disableControls}
    >
      <LockIcon className="w-4 h-4" />
    </button>
    <button className="p-1 text-gray-400 hover:text-red-500" type="button" disabled>
      <MicIcon className="w-5 h-5" />
    </button>
  </div>
);

const Timeline: React.FC<{ height: number }> = ({ height }) => {
  const {
    assets,
    audioTracks,
    contentTracks,
    addVisualClip,
    addMusicClip,
    updateAudioClip,
    updateContentClip,
    toggleContentTrackLock,
    toggleContentTrackVisibility,
    toggleAudioTrackMute,
    toggleAudioTrackSolo,
    toggleAudioTrackLock,
    selectEntity,
    selected,
    timelineDuration,
    currentTime,
    setCurrentTime,
    mode,
    setMode,
    isPlaying,
    play,
    pause,
  } = useCanvasState();

  const [pixelsPerSecond, setPixelsPerSecond] = React.useState(BASE_PIXELS_PER_SECOND);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const timelineTracksRef = React.useRef<HTMLDivElement>(null);

  const handleZoomChange = React.useCallback((value: number) => {
    setPixelsPerSecond(clamp(value, MIN_PIXELS_PER_SECOND, MAX_PIXELS_PER_SECOND));
  }, []);

  const timelinePixelWidth = Math.max(1, timelineDuration * pixelsPerSecond);

  const { dragState, setDragState, getTimeFromClientX } = useClipDrag(
    timelineDuration,
    contentTracks,
    audioTracks,
    updateContentClip,
    updateAudioClip,
    mode,
    pixelsPerSecond,
    scrollContainerRef,
    timelineTracksRef
  );

  const [scrubPointer, setScrubPointer] = React.useState<number | null>(null);

  const selectedAudioClipId = selected?.kind === 'audio' ? selected.id : null;
  const selectedContentClipId = React.useMemo(() => {
    if (selected?.kind !== 'canvas') {
      return null;
    }
    const asset = assets.find((item) => item.id === selected.id);
    return asset?.timeline?.clipId ?? null;
  }, [assets, selected]);

  const handleTogglePlay = React.useCallback(() => {
    if (isPlaying) {
      pause();
      return;
    }
    if (mode !== 'play') {
      setMode('play');
    }
    play();
  }, [isPlaying, mode, pause, play, setMode]);

  const handleAudioClipPointerDown = React.useCallback(
    (clip: AudioClip, trackLocked: boolean, trackId: string) =>
      (event: React.PointerEvent<HTMLDivElement>) => {
        if (mode !== 'edit' || trackLocked) {
          return;
        }
        event.preventDefault();
        const pointerTime = getTimeFromClientX(event.clientX);
        setDragState({
          mode: 'move',
          clipId: clip.id,
          pointerId: event.pointerId,
          offset: pointerTime - clip.start,
          kind: 'audio',
          trackId,
        });
        selectEntity({ kind: 'audio', id: clip.id });
      },
    [getTimeFromClientX, mode, selectEntity, setDragState]
  );

  const handleContentClipPointerDown = React.useCallback(
    (clip: ContentClip, trackLocked: boolean, trackId: string) =>
      (event: React.PointerEvent<HTMLDivElement>) => {
        if (mode !== 'edit' || trackLocked) {
          return;
        }
        event.preventDefault();
        const pointerTime = getTimeFromClientX(event.clientX);
        setDragState({
          mode: 'move',
          clipId: clip.id,
          pointerId: event.pointerId,
          offset: pointerTime - clip.start,
          kind: 'content',
          trackId,
        });
        selectEntity({ kind: 'canvas', id: clip.canvasAssetId });
      },
    [getTimeFromClientX, mode, selectEntity, setDragState]
  );

  const handleResizeStart = React.useCallback(
    (clipId: string, kind: 'audio' | 'content', trackLocked: boolean, trackId: string) =>
      (event: React.PointerEvent<HTMLDivElement>) => {
        if (mode !== 'edit' || trackLocked) {
          return;
        }
        event.preventDefault();
        setDragState({ mode: 'resize-start', clipId, pointerId: event.pointerId, offset: 0, kind, trackId });
      },
    [mode, setDragState]
  );

  const handleResizeEnd = React.useCallback(
    (clipId: string, kind: 'audio' | 'content', trackLocked: boolean, trackId: string) =>
      (event: React.PointerEvent<HTMLDivElement>) => {
        if (mode !== 'edit' || trackLocked) {
          return;
        }
        event.preventDefault();
        setDragState({ mode: 'resize-end', clipId, pointerId: event.pointerId, offset: 0, kind, trackId });
      },
    [mode, setDragState]
  );

  const handleContentTrackDrop = React.useCallback(
    (trackIndex: number, locked: boolean) => (event: React.DragEvent<HTMLDivElement>) => {
      if (mode !== 'edit' || locked) {
        return;
      }
      if (!event.dataTransfer.types.includes(ASSET_DRAG_TYPE)) {
        return;
      }
      event.preventDefault();
      try {
        const payload = JSON.parse(event.dataTransfer.getData(ASSET_DRAG_TYPE)) as {
          assetId: string;
          type: string;
        };
        if (payload.type === 'music') {
          return;
        }
        const start = getTimeFromClientX(event.clientX);
        addVisualClip(payload.assetId, { start, trackIndex });
        setCurrentTime(start);
      } catch (error) {
        // ignore invalid payloads
      }
    },
    [addVisualClip, getTimeFromClientX, mode, setCurrentTime]
  );

  const handleAudioTrackDrop = React.useCallback(
    (trackIndex: number, locked: boolean) => (event: React.DragEvent<HTMLDivElement>) => {
      if (mode !== 'edit' || locked) {
        return;
      }
      if (!event.dataTransfer.types.includes(ASSET_DRAG_TYPE)) {
        return;
      }
      event.preventDefault();
      try {
        const payload = JSON.parse(event.dataTransfer.getData(ASSET_DRAG_TYPE)) as {
          assetId: string;
          type: string;
        };
        if (payload.type !== 'music') {
          return;
        }
        const start = getTimeFromClientX(event.clientX);
        addMusicClip(payload.assetId, { start, trackIndex });
      } catch (error) {
        // ignore invalid payloads
      }
    },
    [addMusicClip, getTimeFromClientX, mode]
  );

  const handleDragOver = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes(ASSET_DRAG_TYPE)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const markerStep = React.useMemo(() => {
    const desiredPixelsBetweenMarkers = 80;
    const stepOptions = [0.25, 0.5, 1, 2, 5, 10, 15, 30, 60];
    const minimumSeconds = desiredPixelsBetweenMarkers / pixelsPerSecond;
    const matchedStep = stepOptions.find((step) => step >= minimumSeconds);
    return matchedStep ?? stepOptions[stepOptions.length - 1];
  }, [pixelsPerSecond]);

  const markers = React.useMemo(() => {
    const values: number[] = [];
    for (let time = 0; time <= timelineDuration; time += markerStep) {
      values.push(Number(time.toFixed(6)));
    }
    if (values[values.length - 1] !== timelineDuration) {
      values.push(timelineDuration);
    }
    return values;
  }, [markerStep, timelineDuration]);

  const scrubPosition = Math.min(currentTime, timelineDuration) * pixelsPerSecond;
  const scrubPixel = Math.round(scrubPosition * 1000) / 1000;

  const startScrub = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const time = getTimeFromClientX(event.clientX);
      setCurrentTime(time);
      setScrubPointer(event.pointerId);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [getTimeFromClientX, setCurrentTime]
  );

  React.useEffect(() => {
    if (scrubPointer === null) {
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== scrubPointer) {
        return;
      }
      setCurrentTime(getTimeFromClientX(event.clientX));
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerId === scrubPointer) {
        setScrubPointer(null);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [getTimeFromClientX, scrubPointer, setCurrentTime]);

  return (
    <footer className="bg-[#252526] border-t border-zinc-700 flex flex-col flex-shrink-0" style={{ height }}>
      <TimelineToolbar
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        mode={mode}
        setMode={setMode}
        pixelsPerSecond={pixelsPerSecond}
        onZoomChange={handleZoomChange}
      />
      <div className="flex flex-1 min-h-0">
        <TimelineTools />
        <div className="flex-1 overflow-auto relative" ref={scrollContainerRef}>
          <div className="min-w-max" style={{ width: TRACK_PANEL_WIDTH + timelinePixelWidth }}>
            <div className="sticky top-0 z-20 bg-[#252526] border-b border-zinc-700">
              <div className="flex">
                <div
                  className="h-14 border-r border-zinc-700 flex items-center px-3 sticky left-0 z-30 bg-[#252526]"
                  style={{ width: TRACK_PANEL_WIDTH }}
                >
                  <div className="text-xs font-mono text-gray-300">{formatDetailedTime(currentTime)}</div>
                </div>
                <div className="relative h-14 shrink-0" style={{ width: timelinePixelWidth }}>
                  <div role="presentation" className="absolute inset-0 cursor-ew-resize" onPointerDown={startScrub} />
                  {markers.map((time) => {
                    const position = Math.round(time * pixelsPerSecond * 1000) / 1000;
                    const isStart = time === 0;
                    return (
                      <div
                        key={time}
                        className="absolute h-full flex flex-col items-start"
                        style={{
                          left: position,
                          transform: `translateX(${isStart ? 0 : -50}%)`,
                          minWidth: isStart ? undefined : '0.01px',
                        }}
                      >
                        <span className="text-xs text-gray-400">
                          {markerStep < 1 ? formatDetailedTime(time) : formatBaseTime(time)}
                        </span>
                        <div className="w-px h-3 bg-gray-500 mt-1" />
                      </div>
                    );
                  })}
                  <div
                    className="pointer-events-none absolute top-0 bottom-0 w-px bg-yellow-400"
                    style={{ left: scrubPixel }}
                  />
                  <div
                    className="pointer-events-none absolute -bottom-1 w-2 h-2 rounded-full bg-yellow-400 translate-x-[-50%]"
                    style={{ left: scrubPixel }}
                  />
                </div>
              </div>
            </div>

            <div className="flex w-full">
              <div
                className="flex-shrink-0 sticky left-0 z-10 bg-[#252526] border-r border-zinc-700"
                style={{ width: TRACK_PANEL_WIDTH }}
              >
                {contentTracks.map((track) => (
                  <ContentTrackHeader
                    key={track.id}
                    name={track.name}
                    locked={track.locked}
                    hidden={track.hidden}
                    onToggleLock={() => toggleContentTrackLock(track.id)}
                    onToggleVisibility={() => toggleContentTrackVisibility(track.id)}
                    disableControls={mode !== 'edit'}
                  />
                ))}
                {audioTracks.map((track) => (
                  <AudioTrackHeader
                    key={track.id}
                    name={track.name ?? track.id}
                    muted={track.muted}
                    solo={track.solo}
                    locked={track.locked}
                    onToggleMute={() => toggleAudioTrackMute(track.id)}
                    onToggleSolo={() => toggleAudioTrackSolo(track.id)}
                    onToggleLock={() => toggleAudioTrackLock(track.id)}
                    disableControls={mode !== 'edit'}
                  />
                ))}
              </div>
              <div
                className="relative shrink-0"
                style={{ width: timelinePixelWidth }}
                ref={timelineTracksRef}
              >
                <div
                  className="pointer-events-none absolute top-0 bottom-0 w-px bg-yellow-400 z-30"
                  style={{ left: scrubPixel }}
                />
                {contentTracks.map((track, trackIndex) => (
                  <div
                    key={track.id}
                    className="relative h-20 border-b border-zinc-800"
                    data-track-kind="content"
                    data-track-id={track.id}
                    data-track-locked={track.locked ? 'true' : 'false'}
                    onDragOver={handleDragOver}
                    onDrop={handleContentTrackDrop(trackIndex, Boolean(track.locked))}
                  >
                    {track.clips.map((clip) => (
                      <TimelineClip
                        key={clip.id}
                        clip={{ ...clip, kind: 'content' }}
                        timelineDuration={timelineDuration}
                        pixelsPerSecond={pixelsPerSecond}
                        isSelected={selectedContentClipId === clip.id}
                        isDragging={dragState?.clipId === clip.id}
                        isLocked={Boolean(track.locked)}
                        mode={mode}
                        onBodyPointerDown={handleContentClipPointerDown(clip, Boolean(track.locked), track.id)}
                        onResizeStart={handleResizeStart(clip.id, 'content', Boolean(track.locked), track.id)}
                        onResizeEnd={handleResizeEnd(clip.id, 'content', Boolean(track.locked), track.id)}
                      />
                    ))}
                    {track.clips.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 uppercase tracking-wide pointer-events-none">
                        Drop visuals here
                      </div>
                    )}
                  </div>
                ))}
                {audioTracks.map((track, trackIndex) => (
                  <div
                    key={track.id}
                    className="relative h-20 border-b border-zinc-800"
                    data-track-kind="audio"
                    data-track-id={track.id}
                    data-track-locked={track.locked ? 'true' : 'false'}
                    onDragOver={handleDragOver}
                    onDrop={handleAudioTrackDrop(trackIndex, Boolean(track.locked))}
                  >
                    {track.clips.map((clip) => (
                      <TimelineClip
                        key={clip.id}
                        clip={{ ...clip, kind: 'audio' }}
                        timelineDuration={timelineDuration}
                        pixelsPerSecond={pixelsPerSecond}
                        isSelected={selectedAudioClipId === clip.id}
                        isDragging={dragState?.clipId === clip.id}
                        isLocked={Boolean(track.locked)}
                        mode={mode}
                        onBodyPointerDown={handleAudioClipPointerDown(clip, Boolean(track.locked), track.id)}
                        onResizeStart={handleResizeStart(clip.id, 'audio', Boolean(track.locked), track.id)}
                        onResizeEnd={handleResizeEnd(clip.id, 'audio', Boolean(track.locked), track.id)}
                      />
                    ))}
                    {track.clips.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 uppercase tracking-wide pointer-events-none">
                        Drop audio here
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-16 border-l border-zinc-700 flex flex-col flex-shrink-0">
          <div className="h-14 border-b border-zinc-700" />
          {contentTracks.map((track) => (
            <div key={track.id} className="h-20 border-b border-zinc-800 flex items-center justify-center p-2">
              <div className="text-xs text-gray-500">{track.clips.length} clips</div>
            </div>
          ))}
          {audioTracks.map((track) => (
            <div key={track.id} className="h-20 border-b border-zinc-800 flex items-center justify-center p-2">
              <div className="w-2 h-full bg-zinc-700 rounded-full overflow-hidden">
                <div className="bg-green-500 w-full" style={{ height: `${track.clips.length > 0 ? 60 : 10}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Timeline;
