import React from 'react';
import {
  TIMELINE_TRACKS,
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
  EyeIcon,
  LockIcon,
  MicIcon,
} from '../constants';
import type { Track, Clip } from '../types';

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
    return Array.from({ length: 150 }, () => random() * 0.8 + 0.2);
  }, [seed]);

  return (
    <div className="flex items-center h-full w-full">
      {bars.map((height, i) => (
        <div key={i} className="w-px bg-green-400" style={{ height: `${height * 100}%` }} />
      ))}
    </div>
  );
};

const VideoThumbnails: React.FC = () => (
  <div className="flex h-full w-full overflow-hidden">
    {Array.from({ length: 10 }).map((_, i) => (
      <img
        key={i}
        src={`https://picsum.photos/100/50?random=${i + 20}`}
        className="h-full w-auto"
        alt="video thumbnail"
      />
    ))}
  </div>
);

type TimelineClipProps = {
  clip: Clip;
  timelineDuration: number;
  isDragging: boolean;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
};

const TimelineClip: React.FC<TimelineClipProps> = ({
  clip,
  timelineDuration,
  isDragging,
  onPointerDown,
}) => {
  const left = (clip.start / timelineDuration) * 100;
  const width = (clip.duration / timelineDuration) * 100;

  return (
    <div
      onPointerDown={onPointerDown}
      role="button"
      tabIndex={0}
      className={`absolute h-full flex items-center rounded-md overflow-hidden border border-black/30 cursor-grab active:cursor-grabbing transition-[box-shadow,transform] ${
        clip.type === 'video' ? 'bg-purple-600' : 'bg-green-600'
      } ${isDragging ? 'ring-2 ring-blue-400 shadow-lg scale-[1.01]' : ''}`}
      style={{ left: `${left}%`, width: `${width}%`, height: '80%' }}
    >
      <div className="w-1 h-full bg-white/20" />
      <div className="w-full h-full opacity-80 flex-1">
        {clip.type === 'video' ? <VideoThumbnails /> : <AudioWaveform seed={clip.id} />}
      </div>
      <div className="w-1 h-full bg-white/20" />
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

const TrackHeader: React.FC<{ track: Track }> = ({ track }) => {
  const isVideo = track.type === 'video';
  return (
    <div className="h-16 flex items-center px-2 border-b border-zinc-800 space-x-2">
      <div className="flex-1 flex flex-col justify-center">
        <span className="font-bold text-sm">{track.id}</span>
      </div>
      {isVideo ? (
        <>
          <button className="p-1 text-gray-400 hover:text-white">
            <EyeIcon className="w-5 h-5" />
          </button>
          <button
            className={`p-1 ${track.locked ? 'text-blue-400' : 'text-gray-400'} hover:text-white`}
          >
            <LockIcon className="w-5 h-5" />
          </button>
        </>
      ) : (
        <>
          <button
            className={`p-1 rounded w-6 h-6 text-xs font-bold ${
              track.muted ? 'bg-yellow-500 text-black' : 'bg-zinc-600 text-gray-300'
            } hover:bg-yellow-400`}
          >
            M
          </button>
          <button
            className={`p-1 rounded w-6 h-6 text-xs font-bold ${
              track.solo ? 'bg-green-500 text-black' : 'bg-zinc-600 text-gray-300'
            } hover:bg-green-400`}
          >
            S
          </button>
          <button className="p-1 text-gray-400 hover:text-red-500">
            <MicIcon className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};

type TimelineProps = {
  height: number;
};

const Timeline: React.FC<TimelineProps> = ({ height }) => {
  const duration = 300; // 5 minutes
  const markers = React.useMemo(
    () => Array.from({ length: Math.floor(duration / 15) + 1 }, (_, i) => i * 15),
    [duration]
  );
  const [tracks, setTracks] = React.useState<Track[]>(() =>
    TIMELINE_TRACKS.map(track => ({
      ...track,
      clips: track.clips.map(clip => ({ ...clip })),
    }))
  );
  const [dragState, setDragState] = React.useState<{
    trackIndex: number;
    clipIndex: number;
    pointerId: number;
    offset: number;
    clipId: string;
  } | null>(null);
  const timelineContentRef = React.useRef<HTMLDivElement>(null);
  const getVolumeLevel = React.useMemo(() => {
    const cache = new Map<string, number>();
    return (trackId: string) => {
      if (!cache.has(trackId)) {
        let hash = 0;
        for (let i = 0; i < trackId.length; i += 1) {
          hash = (hash << 5) - hash + trackId.charCodeAt(i);
          hash |= 0;
        }
        const normalized = Math.abs(hash % 61) + 20;
        cache.set(trackId, normalized);
      }
      return cache.get(trackId)!;
    };
  }, []);

  const getTimeFromClientX = React.useCallback(
    (clientX: number) => {
      const rect = timelineContentRef.current?.getBoundingClientRect();
      if (!rect) return 0;
      const position = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      const ratio = rect.width === 0 ? 0 : position / rect.width;
      return ratio * duration;
    },
    [duration]
  );

  React.useEffect(() => {
    if (!dragState) {
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== dragState.pointerId) {
        return;
      }

      setTracks(prev => {
        const track = prev[dragState.trackIndex];
        if (!track) {
          return prev;
        }
        const clip = track.clips[dragState.clipIndex];
        if (!clip) {
          return prev;
        }

        const pointerTime = getTimeFromClientX(event.clientX);
        const newStart = Math.min(
          Math.max(pointerTime - dragState.offset, 0),
          duration - clip.duration
        );

        const updatedTrack: Track = {
          ...track,
          clips: track.clips.map((existingClip, index) =>
            index === dragState.clipIndex ? { ...existingClip, start: newStart } : existingClip
          ),
        };

        const updatedTracks = [...prev];
        updatedTracks[dragState.trackIndex] = updatedTrack;
        return updatedTracks;
      });
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
  }, [dragState, duration, getTimeFromClientX]);

  const handleClipPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    trackIndex: number,
    clipIndex: number
  ) => {
    const clip = tracks[trackIndex]?.clips[clipIndex];
    if (!clip) {
      return;
    }

    event.preventDefault();
    const pointerTime = getTimeFromClientX(event.clientX);
    setDragState({
      trackIndex,
      clipIndex,
      pointerId: event.pointerId,
      offset: pointerTime - clip.start,
      clipId: clip.id,
    });
  };

  return (
    <footer
      className="bg-[#252526] border-t border-zinc-700 flex flex-col flex-shrink-0"
      style={{ height }}
    >
      <TimelineToolbar />
      <div className="flex flex-1 min-h-0">
        <TimelineTools />
        <div className="flex-1 overflow-auto relative" id="timeline-scroll-container">
          <div className="relative h-full" style={{ width: '200%' }} ref={timelineContentRef}>
            {/* Ruler */}
            <div className="h-8 flex sticky top-0 z-20 bg-[#252526]">
              <div className="w-48 flex-shrink-0 sticky left-0 z-10 bg-[#252526] border-r border-b border-zinc-700 flex items-center justify-start p-2">
                <span className="text-xs text-gray-400">00:00:00:00</span>
              </div>
              <div className="flex-1 border-b border-zinc-700 relative">
                {markers.map(time => {
                  const percentage = (time / duration) * 100;
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

            {/* Tracks */}
            <div className="flex w-full">
              {/* Track Headers */}
              <div className="w-48 flex-shrink-0 sticky left-0 z-10 bg-[#252526] border-r border-zinc-700">
                {tracks.map(track => (
                  <TrackHeader key={track.id} track={track} />
                ))}
              </div>
              {/* Track Clips */}
              <div className="flex-1 relative">
                {tracks.map((track, trackIndex) => (
                  <div key={track.id} className="relative h-16 border-b border-zinc-800">
                    {track.clips.map((clip, clipIndex) => (
                      <TimelineClip
                        key={clip.id}
                        clip={clip}
                        timelineDuration={duration}
                        isDragging={
                          dragState?.clipId === clip.id &&
                          dragState.trackIndex === trackIndex &&
                          dragState.clipIndex === clipIndex
                        }
                        onPointerDown={event => handleClipPointerDown(event, trackIndex, clipIndex)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Playhead */}
            <div
              className="absolute top-0 h-full w-0.5 bg-red-500 z-30 pointer-events-none"
              style={{ left: 'calc(12rem + 10%)' }}
            >
              <div className="w-3 h-3 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 absolute top-4 left-1/2 ring-4 ring-[#252526]" />
            </div>
          </div>
        </div>

        {/* Volume Sliders */}
        <div className="w-16 border-l border-zinc-700 flex flex-col flex-shrink-0">
          <div className="h-8 border-b border-zinc-700" />
          {tracks.map(track => (
            <div key={track.id} className="h-16 border-b border-zinc-800 flex items-center justify-center p-2">
              {track.type === 'audio' && (
                <div className="w-2 h-full bg-zinc-700 rounded-full overflow-hidden">
                  <div className="bg-green-500 w-full" style={{ height: `${getVolumeLevel(track.id)}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Timeline;
