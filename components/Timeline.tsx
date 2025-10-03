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
  PlusIcon,
  MagnetIcon,
  LinkIcon,
  MicIcon,
  ASSET_DRAG_TYPE,
} from '../constants';
import { useCanvasState } from '../context/CanvasStateContext';
import type { AudioClip, AudioTrack } from '../types';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

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

const TimelineToolbar: React.FC = () => (
  <div className="h-10 bg-[#2d2d2d] flex items-center justify-between px-4 border-b border-zinc-700 flex-shrink-0">
    <div className="flex items-center space-x-4">
      <button className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-700 rounded">
        <MagnetIcon className="w-5 h-5" />
      </button>
      <button className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-700 rounded">
        <LinkIcon className="w-5 h-5" />
      </button>
    </div>
    <div className="flex items-center space-x-2">
      <button className="p-1.5 text-gray-400 hover:text-white">
        <SkipStartIcon className="w-5 h-5" />
      </button>
      <button className="p-1.5 text-gray-400 hover:text-white">
        <StepBackwardIcon className="w-5 h-5" />
      </button>
      <button className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-500">
        <PlayIcon className="w-6 h-6" />
      </button>
      <button className="p-1.5 text-gray-400 hover:text-white">
        <StepForwardIcon className="w-5 h-5" />
      </button>
      <button className="p-1.5 text-gray-400 hover:text-white">
        <SkipEndIcon className="w-5 h-5" />
      </button>
    </div>
    <div className="flex items-center space-x-4">
      <button className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-700 rounded">
        <PlusIcon className="w-5 h-5" />
      </button>
    </div>
  </div>
);

const TimelineTools: React.FC = () => (
  <div className="w-12 bg-[#252526] border-r border-zinc-700 flex flex-col items-center py-2 space-y-2 flex-shrink-0">
    <button className="p-2 text-white bg-blue-600 rounded-md">
      <SelectToolIcon className="w-6 h-6" />
    </button>
    <button className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-zinc-700">
      <RazorToolIcon className="w-6 h-6" />
    </button>
    <button className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-zinc-700">
      <TextIcon className="w-6 h-6" />
    </button>
  </div>
);

const findClip = (tracks: AudioTrack[], clipId: string) => {
  for (const track of tracks) {
    const clip = track.clips.find((item) => item.id === clipId);
    if (clip) {
      return clip;
    }
  }
  return null;
};

const TimelineClip: React.FC<{
  clip: AudioClip;
  timelineDuration: number;
  isSelected: boolean;
  isDragging: boolean;
  onBodyPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onResizeStart: (event: React.PointerEvent<HTMLDivElement>) => void;
  onResizeEnd: (event: React.PointerEvent<HTMLDivElement>) => void;
}> = ({ clip, timelineDuration, isSelected, isDragging, onBodyPointerDown, onResizeStart, onResizeEnd }) => {
  const left = (clip.start / timelineDuration) * 100;
  const width = (clip.duration / timelineDuration) * 100;

  return (
    <div
      className={`absolute h-full flex items-center rounded-md overflow-hidden border border-black/40 transition-[box-shadow,transform] ${
        isSelected ? 'ring-2 ring-blue-400' : ''
      } ${isDragging ? 'shadow-xl scale-[1.01]' : ''}`}
      style={{ left: `${left}%`, width: `${width}%`, height: '80%' }}
    >
      <div
        role="presentation"
        className="w-1.5 h-full bg-white/30 cursor-ew-resize"
        onPointerDown={onResizeStart}
      />
      <div
        role="button"
        tabIndex={0}
        onPointerDown={onBodyPointerDown}
        className="flex-1 h-full bg-green-600/80 cursor-grab active:cursor-grabbing"
      >
        <div className="h-full w-full">
          <AudioWaveform seed={clip.id} />
        </div>
        <div className="absolute bottom-1 left-2 right-2 text-xs text-white font-semibold truncate pointer-events-none">
          {clip.name}
        </div>
      </div>
      <div
        role="presentation"
        className="w-1.5 h-full bg-white/30 cursor-ew-resize"
        onPointerDown={onResizeEnd}
      />
    </div>
  );
};

const TrackHeader: React.FC<{ track: AudioTrack }> = ({ track }) => (
  <div className="h-16 flex items-center px-2 border-b border-zinc-800 space-x-2">
    <div className="flex-1 flex flex-col justify-center">
      <span className="font-bold text-sm">{track.id}</span>
      <span className="text-xs text-gray-500">Audio track</span>
    </div>
    <button className={`p-1 rounded w-6 h-6 text-xs font-bold ${track.muted ? 'bg-yellow-500 text-black' : 'bg-zinc-600 text-gray-300'}`}>
      M
    </button>
    <button className={`p-1 rounded w-6 h-6 text-xs font-bold ${track.solo ? 'bg-green-500 text-black' : 'bg-zinc-600 text-gray-300'}`}>
      S
    </button>
    <button className="p-1 text-gray-400 hover:text-red-500">
      <MicIcon className="w-5 h-5" />
    </button>
  </div>
);

const clampTime = (value: number, duration: number) => clamp(value, 0, duration);

const usePointerDrag = (
  timelineDuration: number,
  audioTracks: AudioTrack[],
  updateAudioClip: (clipId: string, updates: Partial<AudioClip>) => void
) => {
  const timelineContentRef = React.useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = React.useState<
    | {
        mode: 'move' | 'resize-start' | 'resize-end';
        clipId: string;
        pointerId: number;
        offset: number;
      }
    | null
  >(null);

  React.useEffect(() => {
    if (!dragState) {
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== dragState.pointerId) {
        return;
      }
      const trackClip = findClip(audioTracks, dragState.clipId);
      if (!trackClip) {
        return;
      }
      const timelineRect = timelineContentRef.current?.getBoundingClientRect();
      if (!timelineRect) {
        return;
      }
      const ratio = timelineRect.width === 0 ? 0 : clamp((event.clientX - timelineRect.left) / timelineRect.width, 0, 1);
      const pointerTime = ratio * timelineDuration;

      if (dragState.mode === 'move') {
        const newStart = clampTime(pointerTime - dragState.offset, timelineDuration - trackClip.duration);
        updateAudioClip(trackClip.id, { start: newStart });
      } else if (dragState.mode === 'resize-start') {
        const endTime = trackClip.start + trackClip.duration;
        const newStart = clamp(pointerTime, 0, endTime - 1);
        const newDuration = clamp(endTime - newStart, 1, timelineDuration - newStart);
        updateAudioClip(trackClip.id, { start: newStart, duration: newDuration });
      } else if (dragState.mode === 'resize-end') {
        const newEnd = clamp(pointerTime, trackClip.start + 1, timelineDuration);
        const newDuration = clamp(newEnd - trackClip.start, 1, timelineDuration - trackClip.start);
        updateAudioClip(trackClip.id, { duration: newDuration });
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
  }, [audioTracks, dragState, timelineDuration, updateAudioClip]);

  return { dragState, setDragState, timelineContentRef };
};

const Timeline: React.FC<{ height: number }> = ({ height }) => {
  const {
    audioTracks,
    addMusicClip,
    updateAudioClip,
    selectEntity,
    selected,
    timelineDuration,
  } = useCanvasState();
  const { dragState, setDragState, timelineContentRef } = usePointerDrag(
    timelineDuration,
    audioTracks,
    updateAudioClip
  );
  const selectedClipId = selected?.kind === 'audio' ? selected.id : null;

  const getTimeFromClientX = React.useCallback(
    (clientX: number) => {
      const rect = timelineContentRef.current?.getBoundingClientRect();
      if (!rect) {
        return 0;
      }
      const position = clamp(clientX - rect.left, 0, rect.width);
      return rect.width === 0 ? 0 : (position / rect.width) * timelineDuration;
    },
    [timelineContentRef, timelineDuration]
  );

  const handleClipPointerDown = React.useCallback(
    (clip: AudioClip) => (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const pointerTime = getTimeFromClientX(event.clientX);
      const offset = pointerTime - clip.start;
      setDragState({ mode: 'move', clipId: clip.id, pointerId: event.pointerId, offset });
      selectEntity({ kind: 'audio', id: clip.id });
    },
    [getTimeFromClientX, selectEntity, setDragState]
  );

  const handleResize = React.useCallback(
    (clip: AudioClip, mode: 'resize-start' | 'resize-end') =>
      (event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragState({ mode, clipId: clip.id, pointerId: event.pointerId, offset: 0 });
        selectEntity({ kind: 'audio', id: clip.id });
      },
    [selectEntity, setDragState]
  );

  const handleTrackDrop = React.useCallback(
    (trackIndex: number) => (event: React.DragEvent<HTMLDivElement>) => {
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
    [addMusicClip, getTimeFromClientX]
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

  return (
    <footer className="bg-[#252526] border-t border-zinc-700 flex flex-col flex-shrink-0" style={{ height }}>
      <TimelineToolbar />
      <div className="flex flex-1 min-h-0">
        <TimelineTools />
        <div className="flex-1 overflow-auto relative" id="timeline-scroll-container">
          <div className="relative h-full" style={{ width: '200%' }} ref={timelineContentRef}>
            <div className="h-8 flex sticky top-0 z-20 bg-[#252526]">
              <div className="w-48 flex-shrink-0 sticky left-0 z-10 bg-[#252526] border-r border-b border-zinc-700 flex items-center justify-start p-2">
                <span className="text-xs text-gray-400">00:00:00:00</span>
              </div>
              <div className="flex-1 border-b border-zinc-700 relative">
                {markers.map((time) => {
                  const percentage = (time / timelineDuration) * 100;
                  return (
                    <div
                      key={time}
                      className="absolute h-full flex flex-col items-start -translate-x-1/2"
                      style={{ left: `${percentage}%` }}
                    >
                      <span className="text-xs text-gray-400">
                        {new Date(time * 1000).toISOString().substr(14, 5)}
                      </span>
                      <div className="w-px h-2 bg-gray-500 mt-1" />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex w-full">
              <div className="w-48 flex-shrink-0 sticky left-0 z-10 bg-[#252526] border-r border-zinc-700">
                {audioTracks.map((track) => (
                  <TrackHeader key={track.id} track={track} />
                ))}
              </div>
              <div className="flex-1 relative">
                {audioTracks.map((track, trackIndex) => (
                  <div
                    key={track.id}
                    className="relative h-16 border-b border-zinc-800"
                    onDragOver={handleDragOver}
                    onDrop={handleTrackDrop(trackIndex)}
                  >
                    {track.clips.map((clip) => (
                      <TimelineClip
                        key={clip.id}
                        clip={clip}
                        timelineDuration={timelineDuration}
                        isSelected={selectedClipId === clip.id}
                        isDragging={dragState?.clipId === clip.id}
                        onBodyPointerDown={handleClipPointerDown(clip)}
                        onResizeStart={handleResize(clip, 'resize-start')}
                        onResizeEnd={handleResize(clip, 'resize-end')}
                      />
                    ))}
                    {track.clips.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 uppercase tracking-wide pointer-events-none">
                        Drop music here
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-16 border-l border-zinc-700 flex flex-col flex-shrink-0">
          <div className="h-8 border-b border-zinc-700" />
          {audioTracks.map((track) => (
            <div key={track.id} className="h-16 border-b border-zinc-800 flex items-center justify-center p-2">
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
