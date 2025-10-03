import React from 'react';
import type { AssetCategory, LibraryAsset, AudioTrack } from './types';

// Header Icons
export const DeviceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);
export const RefreshIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 15M20 20l-1.5-1.5A9 9 0 013.5 9" />
  </svg>
);
export const FullscreenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
  </svg>
);
export const PanelsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h7a2 2 0 012 2v12H5a2 2 0 01-2-2V5zm11 0h5a2 2 0 012 2v5h-7V5zm0 9h7v5a2 2 0 01-2 2h-5v-7z" />
  </svg>
);
export const AdjustmentsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h4M10 6h10M4 12h6M12 12h8M4 18h2M8 18h12M8 4v4M14 10v4M6 16v4" />
  </svg>
);

// Asset category icons
const CharacterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.5 21a6.5 6.5 0 0113 0" />
  </svg>
);
const BackgroundIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18v14H3z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 13l3 3 4-4 4 4" />
  </svg>
);
const MusicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19a3 3 0 11-6 0 3 3 0 016 0zm12-3a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const GraphicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6l7 12H5z" />
  </svg>
);

export const ASSET_CATEGORIES: AssetCategory[] = [
  { name: 'Characters', type: 'character', icon: CharacterIcon },
  { name: 'Backgrounds', type: 'background', icon: BackgroundIcon },
  { name: 'Music', type: 'music', icon: MusicIcon },
  { name: 'Graphics', type: 'graphic', icon: GraphicIcon },
];

export const LIBRARY_ASSETS: LibraryAsset[] = [
  {
    id: 'char-astronaut',
    type: 'character',
    name: 'Astronaut Alex',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542736667-069246bdbc13?auto=format&fit=crop&w=360&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1542736667-069246bdbc13?auto=format&fit=crop&w=720&q=80',
  },
  {
    id: 'char-chef',
    type: 'character',
    name: 'Chef Clara',
    thumbnailUrl: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=360&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=720&q=80',
  },
  {
    id: 'char-dancer',
    type: 'character',
    name: 'Dancer Diego',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=360&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=720&q=80',
  },
  {
    id: 'bg-city-sunset',
    type: 'background',
    name: 'City Sunset',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=360&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1280&q=80',
  },
  {
    id: 'bg-studio',
    type: 'background',
    name: 'Studio Lights',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?auto=format&fit=crop&w=360&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?auto=format&fit=crop&w=1280&q=80',
  },
  {
    id: 'bg-mountain',
    type: 'background',
    name: 'Mountain Morning',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=360&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1280&q=80',
  },
  {
    id: 'music-chill',
    type: 'music',
    name: 'Chill Breeze',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=360&q=80',
    mediaUrl: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
    duration: 120,
    bpm: 90,
  },
  {
    id: 'music-upbeat',
    type: 'music',
    name: 'Upbeat Energy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=360&q=80',
    mediaUrl: 'https://samplelib.com/lib/preview/mp3/sample-6s.mp3',
    duration: 150,
    bpm: 128,
  },
  {
    id: 'music-piano',
    type: 'music',
    name: 'Piano Reflections',
    thumbnailUrl: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=360&q=80',
    mediaUrl: 'https://samplelib.com/lib/preview/mp3/sample-12s.mp3',
    duration: 180,
    bpm: 72,
  },
  {
    id: 'graphic-starburst',
    type: 'graphic',
    name: 'Starburst Overlay',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526481280695-3c4697e2db87?auto=format&fit=crop&w=360&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1526481280695-3c4697e2db87?auto=format&fit=crop&w=720&q=80',
  },
  {
    id: 'graphic-confetti',
    type: 'graphic',
    name: 'Confetti Trail',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=360&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=720&q=80',
  },
  {
    id: 'graphic-frame',
    type: 'graphic',
    name: 'Neon Frame',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526312426976-f4d754fa9bd6?auto=format&fit=crop&w=360&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1526312426976-f4d754fa9bd6?auto=format&fit=crop&w=720&q=80',
  },
];

export const ASSET_DRAG_TYPE = 'application/x-vid-asset';

export const DEFAULT_AUDIO_TRACKS: AudioTrack[] = [
  { id: 'A1', clips: [], muted: false, solo: false },
  { id: 'A2', clips: [], muted: false, solo: false },
];

// Timeline icons
export const SelectToolIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.72,2.95C7.54,2.53 7.2,2.2 6.79,2.05L6.78,2.05C6.18,1.83 5.49,2.04 5.12,2.58L2.23,6.9C1.94,7.34 2.03,7.94 2.4,8.32L2.4,8.32L8.53,14.45C8.92,14.83 9.51,14.93 9.95,14.64L14.28,11.75C14.82,11.38 15.03,10.69 14.81,10.09L14.81,10.08L12.91,5.16C12.7,4.56 12.06,4.17 11.43,4.17H9.25L7.72,2.95Z" />
  </svg>
);
export const RazorToolIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.41,8.66L13,10.07L15.59,12.66L18.17,10.07L16.76,8.66M5,18L10.07,12.93L12.66,15.51L7.59,20.59H5V18M9.24,5.24L12,8L10.07,9.93L7.34,7.2L9.24,5.24M5.83,11.5L3.24,8.91L4.66,7.5L7.24,10.09L5.83,11.5Z" />
  </svg>
);
export const TextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M7 12h10M9 18h6" />
  </svg>
);
export const SkipStartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16,16.5V7.5L11,12M7,18V6H5V18H7Z" />
  </svg>
);
export const StepBackwardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18,15.5V8.5H16V15.5H18M14,15.5V8.5L8.5,12L14,15.5Z" />
  </svg>
);
export const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
  </svg>
);
export const StepForwardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6,15.5V8.5H8V15.5H6M10,15.5V8.5L15.5,12L10,15.5Z" />
  </svg>
);
export const SkipEndIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8,7.5V16.5L13,12M17,6V18H19V6H17Z" />
  </svg>
);
export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
  </svg>
);
export const MagnetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3,7V13A4,4 0 0,0 7,17H8V21L12,18L16,21V17H17A4,4 0 0,0 21,13V7H17V13H18V7H15V13H16V7H8V13H9V7H6V13H7V7H3Z" />
  </svg>
);
export const LinkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17,18H15V16H17M13,18H11V16H13M9,18H7V16H9M13.5,13H11.5L10.5,15H8.5L12.5,7L16.5,15H14.5L13.5,13M13,11.3L12,9L11,11.3H13Z" />
  </svg>
);
export const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
  </svg>
);
export const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
  </svg>
);
export const MicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
  </svg>
);

export const TIMELINE_DURATION = 300; // seconds

