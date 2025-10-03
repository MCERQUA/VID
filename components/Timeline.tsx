
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
  MicIcon
} from '../constants';
import type { Track, Clip } from '../types';

const AudioWaveform: React.FC = () => {
  const bars = Array.from({ length: 150 }, (_, i) => Math.random() * 0.8 + 0.2);
  return (
    <div className="flex items-center h-full w-full">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-px bg-green-400"
          style={{ height: `${height * 100}%` }}
        />
      ))}
    </div>
  );
};

const VideoThumbnails: React.FC = () => (
  <div className="flex h-full w-full overflow-hidden">
    {Array.from({ length: 10 }).map((_, i) => (
      <img key={i} src={`https://picsum.photos/100/50?random=${i+20}`} className="h-full w-auto" alt="video thumbnail" />
    ))}
  </div>
);


const TimelineClip: React.FC<{ clip: Clip }> = ({ clip }) => {
  const left = (clip.start / 300) * 100; // Assuming timeline is 300s long
  const width = (clip.duration / 300) * 100;

  return (
    <div
      className={`absolute h-full flex items-center rounded-md overflow-hidden cursor-pointer border border-black/30 ${clip.type === 'video' ? 'bg-purple-600' : 'bg-green-600'}`}
      style={{ left: `${left}%`, width: `${width}%`, height: '80%' }}
    >
      <div className="w-1 h-full bg-white/20"></div>
      <div className="w-full h-full opacity-80 flex-1">
        {clip.type === 'video' ? <VideoThumbnails /> : <AudioWaveform />}
      </div>
      <div className="w-1 h-full bg-white/20"></div>
    </div>
  );
};

const TimelineToolbar: React.FC = () => (
  <div className="h-10 bg-[#2d2d2d] flex items-center justify-between px-4 border-b border-zinc-700 flex-shrink-0">
    <div className="flex items-center space-x-4">
       <button className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-700 rounded"><MagnetIcon className="w-5 h-5" /></button>
       <button className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-700 rounded"><LinkIcon className="w-5 h-5" /></button>
    </div>
    <div className="flex items-center space-x-2">
      <button className="p-1.5 text-gray-400 hover:text-white"><SkipStartIcon className="w-5 h-5" /></button>
      <button className="p-1.5 text-gray-400 hover:text-white"><StepBackwardIcon className="w-5 h-5" /></button>
      <button className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-500"><PlayIcon className="w-6 h-6" /></button>
      <button className="p-1.5 text-gray-400 hover:text-white"><StepForwardIcon className="w-5 h-5" /></button>
      <button className="p-1.5 text-gray-400 hover:text-white"><SkipEndIcon className="w-5 h-5" /></button>
    </div>
    <div className="flex items-center space-x-4">
      <button className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-700 rounded"><PlusIcon className="w-5 h-5" /></button>
    </div>
  </div>
);

const TimelineTools: React.FC = () => (
  <div className="w-12 bg-[#252526] border-r border-zinc-700 flex flex-col items-center py-2 space-y-2 flex-shrink-0">
      <button className="p-2 text-white bg-blue-600 rounded-md"><SelectToolIcon className="w-6 h-6" /></button>
      <button className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-zinc-700"><RazorToolIcon className="w-6 h-6" /></button>
      <button className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-zinc-700"><TextIcon className="w-6 h-6" /></button>
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
                    <button className="p-1 text-gray-400 hover:text-white"><EyeIcon className="w-5 h-5" /></button>
                    <button className={`p-1 ${track.locked ? 'text-blue-400' : 'text-gray-400'} hover:text-white`}><LockIcon className="w-5 h-5" /></button>
                </>
            ) : (
                <>
                    <button className={`p-1 rounded w-6 h-6 text-xs font-bold ${track.muted ? 'bg-yellow-500 text-black' : 'bg-zinc-600 text-gray-300'} hover:bg-yellow-400`}>M</button>
                    <button className={`p-1 rounded w-6 h-6 text-xs font-bold ${track.solo ? 'bg-green-500 text-black' : 'bg-zinc-600 text-gray-300'} hover:bg-green-400`}>S</button>
                    <button className="p-1 text-gray-400 hover:text-red-500"><MicIcon className="w-5 h-5" /></button>
                </>
            )}
        </div>
    )
};


const Timeline: React.FC = () => {
  const duration = 300; // 5 minutes
  const markers = Array.from({ length: Math.floor(duration / 15) + 1 }, (_, i) => i * 15);

  return (
    <footer className="h-80 bg-[#252526] border-t border-zinc-700 flex flex-col flex-shrink-0">
      <TimelineToolbar />
      <div className="flex flex-1 min-h-0">
        <TimelineTools />
        <div className="flex-1 overflow-auto relative" id="timeline-scroll-container">
          <div className="relative h-full" style={{ width: '200%' }}>
            
            {/* Ruler */}
            <div className="h-8 flex sticky top-0 z-20 bg-[#252526]">
              <div className="w-48 flex-shrink-0 sticky left-0 z-10 bg-[#252526] border-r border-b border-zinc-700 flex items-center justify-start p-2">
                  <span className="text-xs text-gray-400">00:00:00:00</span>
              </div>
              <div className="flex-1 border-b border-zinc-700 relative">
                  {markers.map(time => {
                    const percentage = (time / duration) * 100;
                    return (
                      <div key={time} className="absolute h-full flex flex-col items-start -translate-x-1/2" style={{ left: `${percentage}%` }}>
                        <span className="text-xs text-gray-400">
                          {new Date(time * 1000).toISOString().substr(14, 5)}
                        </span>
                        <div className="w-px h-2 bg-gray-500 mt-1"></div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Tracks */}
            <div className="flex w-full">
              {/* Track Headers */}
              <div className="w-48 flex-shrink-0 sticky left-0 z-10 bg-[#252526] border-r border-zinc-700">
                  {TIMELINE_TRACKS.map(track => <TrackHeader key={track.id} track={track} />)}
              </div>
              {/* Track Clips */}
              <div className="flex-1 relative">
                  {TIMELINE_TRACKS.map((track, trackIndex) => (
                      <div key={track.id} className="relative h-16 border-b border-zinc-800">
                        {track.clips.map(clip => (
                          <TimelineClip key={clip.id} clip={clip} />
                        ))}
                      </div>
                  ))}
              </div>
            </div>

            {/* Playhead */}
            <div className="absolute top-0 h-full w-0.5 bg-red-500 z-30 pointer-events-none" style={{ left: 'calc(12rem + 10%)' }}>
               <div className="w-3 h-3 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 absolute top-4 left-1/2 ring-4 ring-[#252526]"></div>
            </div>

          </div>
        </div>

        {/* Volume Sliders */}
        <div className="w-16 border-l border-zinc-700 flex flex-col flex-shrink-0">
            <div className="h-8 border-b border-zinc-700"></div>
            {TIMELINE_TRACKS.map(track => (
                <div key={track.id} className="h-16 border-b border-zinc-800 flex items-center justify-center p-2">
                    {track.type === 'audio' && (
                        <div className="w-2 h-full bg-zinc-700 rounded-full overflow-hidden">
                            <div className="bg-green-500 w-full" style={{ height: `${Math.random() * 60 + 20}%`}}></div>
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