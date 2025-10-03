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

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

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
}> = ({ isPlaying, onTogglePlay, mode, setMode }) => (
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
};

const useClipDrag = (
  timelineDuration: number,
  contentTracks: ReturnType<typeof useCanvasState>['contentTracks'],
  audioTracks: ReturnType<typeof useCanvasState>['audioTracks'],
  updateContentClip: (clipId: string, updates: Partial<ContentClip>) => void,
  updateAudioClip: (clipId: string, updates: Partial<AudioClip>) => void,
  mode: TimelineMode,
  moveContentClip: (clipId: string, trackIndex: number) => void,
  moveAudioClip: (clipId: string, trackIndex: number) => void,
  getContentTrackIndexFromClientY: (clientY: number) => number | null,
  getAudioTrackIndexFromClientY: (clientY: number) => number | null
) => {
  const timelineContentRef = React.useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = React.useState<DragState | null>(null);

  const getTimeFromClientX = React.useCallback(
    (clientX: number) => {
      const rect = timelineContentRef.current?.getBoundingClientRect();
      if (!rect) {
        return 0;
      }
      const position = clamp(clientX - rect.left, 0, rect.width);
      const ratio = rect.width === 0 ? 0 : position / rect.width;
      return ratio * timelineDuration;
    },
    [timelineDuration]
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
        let trackIndexOfClip = -1;
        for (let trackIndex = 0; trackIndex < audioTracks.length; trackIndex += 1) {
          const track = audioTracks[trackIndex];
          const clip = track.clips.find((item) => item.id === dragState.clipId);
          if (clip) {
            target = clip;
            trackIndexOfClip = trackIndex;
            break;
          }
        }
        if (!target) {
          return;
        }

        if (dragState.mode === 'move') {
          const destinationTrackIndex = getAudioTrackIndexFromClientY(event.clientY);
          if (
            destinationTrackIndex !== null &&
            destinationTrackIndex !== trackIndexOfClip &&
            !audioTracks[destinationTrackIndex]?.locked
          ) {
            moveAudioClip(target.id, destinationTrackIndex);
            trackIndexOfClip = destinationTrackIndex;
          }
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
        let trackIndexOfClip = -1;
        for (let trackIndex = 0; trackIndex < contentTracks.length; trackIndex += 1) {
          const track = contentTracks[trackIndex];
          const clip = track.clips.find((item) => item.id === dragState.clipId);
          if (clip) {
            target = clip;
            trackIndexOfClip = trackIndex;
            break;
          }
        }
        if (!target) {
          return;
        }

        if (dragState.mode === 'move') {
          const destinationTrackIndex = getContentTrackIndexFromClientY(event.clientY);
          if (
            destinationTrackIndex !== null &&
            destinationTrackIndex !== trackIndexOfClip &&
            !contentTracks[destinationTrackIndex]?.locked
          ) {
            moveContentClip(target.id, destinationTrackIndex);
            trackIndexOfClip = destinationTrackIndex;
          }
          const newStart = clamp(pointerTime - dragState.offset, 0, timelineDuration - target.duration);
          updateContentClip(target.id, { start: newStart });
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
      if (event.pointerId === dragState.pointerId) {
        setDragState(null);
      }
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
    getAudioTrackIndexFromClientY,
    getContentTrackIndexFromClientY,
    getTimeFromClientX,
    mode,
    moveAudioClip,
    moveContentClip,
    timelineDuration,
    updateAudioClip,
    updateContentClip,
  ]);

  React.useEffect(() => {
    if (mode !== 'edit') {
      setDragState(null);
    }
  }, [mode]);

  return { dragState, setDragState, timelineContentRef, getTimeFromClientX };
};

const TimelineClip: React.FC<{
  clip:
    | (AudioClip & { kind: 'audio' })
    | (ContentClip & { kind: 'content'; thumbnailUrl?: string });
  timelineDuration: number;
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
  isSelected,
  isDragging,
  isLocked,
  mode,
  onBodyPointerDown,
  onResizeStart,
  onResizeEnd,
}) => {
  const left = (clip.start / timelineDuration) * 100;
  const width = (clip.duration / timelineDuration) * 100;
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
      style={{ left: `${left}%`, width: `${width}%`, height: '80%' }}
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
    moveAudioClip,
    moveContentClip,
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

  const contentTrackRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const audioTrackRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const getContentTrackIndexFromClientY = React.useCallback((clientY: number) => {
    for (let index = 0; index < contentTrackRefs.current.length; index += 1) {
      const element = contentTrackRefs.current[index];
      if (!element) {
        continue;
      }
      const rect = element.getBoundingClientRect();
      if (clientY >= rect.top && clientY <= rect.bottom) {
        return index;
      }
    }
    return null;
  }, []);

  const getAudioTrackIndexFromClientY = React.useCallback((clientY: number) => {
    for (let index = 0; index < audioTrackRefs.current.length; index += 1) {
      const element = audioTrackRefs.current[index];
      if (!element) {
        continue;
      }
      const rect = element.getBoundingClientRect();
      if (clientY >= rect.top && clientY <= rect.bottom) {
        return index;
      }
    }
    return null;
  }, []);

  const { dragState, setDragState, timelineContentRef, getTimeFromClientX } = useClipDrag(
    timelineDuration,
    contentTracks,
    audioTracks,
    updateContentClip,
    updateAudioClip,
    mode,
    moveContentClip,
    moveAudioClip,
    getContentTrackIndexFromClientY,
    getAudioTrackIndexFromClientY
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
    (clip: AudioClip, trackLocked: boolean) => (event: React.PointerEvent<HTMLDivElement>) => {
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
      });
      selectEntity({ kind: 'audio', id: clip.id });
    },
    [getTimeFromClientX, mode, selectEntity, setDragState]
  );

  const handleContentClipPointerDown = React.useCallback(
    (clip: ContentClip, trackLocked: boolean) => (event: React.PointerEvent<HTMLDivElement>) => {
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
      });
      selectEntity({ kind: 'canvas', id: clip.canvasAssetId });
    },
    [getTimeFromClientX, mode, selectEntity, setDragState]
  );

  const handleResizeStart = React.useCallback(
    (clipId: string, kind: 'audio' | 'content', trackLocked: boolean) =>
      (event: React.PointerEvent<HTMLDivElement>) => {
        if (mode !== 'edit' || trackLocked) {
          return;
        }
        event.preventDefault();
        setDragState({ mode: 'resize-start', clipId, pointerId: event.pointerId, offset: 0, kind });
      },
    [mode, setDragState]
  );

  const handleResizeEnd = React.useCallback(
    (clipId: string, kind: 'audio' | 'content', trackLocked: boolean) =>
      (event: React.PointerEvent<HTMLDivElement>) => {
        if (mode !== 'edit' || trackLocked) {
          return;
        }
        event.preventDefault();
        setDragState({ mode: 'resize-end', clipId, pointerId: event.pointerId, offset: 0, kind });
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
      } catch (error) {
        // ignore invalid payloads
      }
    },
    [addVisualClip, getTimeFromClientX, mode]
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

  const markers = React.useMemo(
    () => Array.from({ length: Math.floor(timelineDuration / 15) + 1 }, (_, index) => index * 15),
    [timelineDuration]
  );

  const sliderPercentage = timelineDuration === 0 ? 0 : (currentTime / timelineDuration) * 100;

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
      <TimelineToolbar isPlaying={isPlaying} onTogglePlay={handleTogglePlay} mode={mode} setMode={setMode} />
      <div className="flex flex-1 min-h-0">
        <TimelineTools />
        <div className="flex-1 overflow-auto relative" id="timeline-scroll-container">
          <div className="relative h-full" style={{ width: '200%' }} ref={timelineContentRef}>
            <div className="sticky top-0 z-20 bg-[#252526] border-b border-zinc-700">
              <div className="relative h-14">
                <div
                  role="presentation"
                  className="absolute inset-0 cursor-ew-resize"
                  onPointerDown={startScrub}
                />
                <div className="absolute left-3 top-1 text-xs font-mono text-gray-300">{formatTime(currentTime)}</div>
                {markers.map((time) => {
                  const percentage = (time / timelineDuration) * 100;
                  return (
                    <div
                      key={time}
                      className="absolute h-full flex flex-col items-start -translate-x-1/2"
                      style={{ left: `${percentage}%` }}
                    >
                      <span className="text-xs text-gray-400">{new Date(time * 1000).toISOString().substr(14, 5)}</span>
                      <div className="w-px h-3 bg-gray-500 mt-1" />
                    </div>
                  );
                })}
                <div
                  className="absolute top-0 bottom-0 w-px bg-yellow-400"
                  style={{ left: `${sliderPercentage}%` }}
                />
                <div
                  className="absolute -bottom-1 w-2 h-2 rounded-full bg-yellow-400 translate-x-[-50%]"
                  style={{ left: `${sliderPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex w-full">
              <div className="w-48 flex-shrink-0 sticky left-0 z-10 bg-[#252526] border-r border-zinc-700">
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
              <div className="flex-1 relative">
                {contentTracks.map((track, trackIndex) => (
                  <div
                    key={track.id}
                    className="relative h-20 border-b border-zinc-800"
                    onDragOver={handleDragOver}
                    onDrop={handleContentTrackDrop(trackIndex, Boolean(track.locked))}
                    ref={(element) => {
                      contentTrackRefs.current[trackIndex] = element;
                    }}
                  >
                    {track.clips.map((clip) => (
                      <TimelineClip
                        key={clip.id}
                        clip={{ ...clip, kind: 'content' }}
                        timelineDuration={timelineDuration}
                        isSelected={selectedContentClipId === clip.id}
                        isDragging={dragState?.clipId === clip.id}
                        isLocked={Boolean(track.locked)}
                        mode={mode}
                        onBodyPointerDown={handleContentClipPointerDown(clip, Boolean(track.locked))}
                        onResizeStart={handleResizeStart(clip.id, 'content', Boolean(track.locked))}
                        onResizeEnd={handleResizeEnd(clip.id, 'content', Boolean(track.locked))}
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
                    onDragOver={handleDragOver}
                    onDrop={handleAudioTrackDrop(trackIndex, Boolean(track.locked))}
                    ref={(element) => {
                      audioTrackRefs.current[trackIndex] = element;
                    }}
                  >
                    {track.clips.map((clip) => (
                      <TimelineClip
                        key={clip.id}
                        clip={{ ...clip, kind: 'audio' }}
                        timelineDuration={timelineDuration}
                        isSelected={selectedAudioClipId === clip.id}
                        isDragging={dragState?.clipId === clip.id}
                        isLocked={Boolean(track.locked)}
                        mode={mode}
                        onBodyPointerDown={handleAudioClipPointerDown(clip, Boolean(track.locked))}
                        onResizeStart={handleResizeStart(clip.id, 'audio', Boolean(track.locked))}
                        onResizeEnd={handleResizeEnd(clip.id, 'audio', Boolean(track.locked))}
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
