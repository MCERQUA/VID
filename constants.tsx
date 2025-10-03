import React from 'react';
import type { AssetCategory, Template, Property, Track } from './types';

// Icons for Header
export const DeviceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
);
export const RefreshIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 15M20 20l-1.5-1.5A9 9 0 013.5 9" /></svg>
);
export const FullscreenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" /></svg>
);


// Icons for Left Sidebar
const TemplatesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
);
const ElementsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
);
const UploadsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
);
// FIX: Export TextIcon so it can be used in Timeline.tsx
export const TextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M7 12h10M9 18h6" /></svg>
);
const AudioIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 6l12-3" /></svg>
);

export const ASSET_CATEGORIES: AssetCategory[] = [
  { name: 'Templates', icon: TemplatesIcon },
  { name: 'Elements', icon: ElementsIcon },
  { name: 'Uploads', icon: UploadsIcon },
  { name: 'Text', icon: TextIcon },
  { name: 'Audio', icon: AudioIcon },
];

export const TEMPLATE_FILTERS: string[] = ['Christmas', 'Thanksgiving', 'Food', 'Veterans', 'Business'];

export const MOCK_TEMPLATES: Template[] = [
  { id: 1, name: 'Tunnel View', thumbnailUrl: 'https://picsum.photos/360/640?random=1' },
  { id: 2, name: 'Under the Bridge', thumbnailUrl: 'https://picsum.photos/360/640?random=2' },
  { id: 3, name: 'Apartment Building', thumbnailUrl: 'https://picsum.photos/360/640?random=3' },
  { id: 4, name: 'Hand with Grapes', thumbnailUrl: 'https://picsum.photos/360/640?random=4' },
  { id: 5, name: 'Misty Ocean', thumbnailUrl: 'https://picsum.photos/360/640?random=5' },
  { id: 6, name: 'Temple Spire', thumbnailUrl: 'https://picsum.photos/360/640?random=6' },
];

// Data for Right Sidebar
export const PROPERTIES_TABS: string[] = ['Properties', 'Effect Controls', 'Essential Sound', 'Lumetri Color'];

export const PropertyGroup: { title: string; properties: Property[] }[] = [
    {
        title: 'Transform',
        properties: [
            { label: 'Position', value: '960 X   544 Y' },
            { label: 'Anchor point', value: '960 X   544 Y' },
            { label: 'Scale', value: '117 %   100 %', isLinked: true },
            { label: 'Rotation', value: '0°' },
            { label: 'Opacity', value: '100 %' },
        ],
    },
    {
        title: 'Crop',
        properties: [
            { label: 'Left', value: '0.0 %' },
            { label: 'Top', value: '0.0 %' },
            { label: 'Right', value: '0.0 %' },
            { label: 'Bottom', value: '0.0 %' },
        ],
    },
];

// Icons for Timeline
export const SelectToolIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M7.72,2.95C7.54,2.53 7.2,2.2 6.79,2.05L6.78,2.05C6.18,1.83 5.49,2.04 5.12,2.58L2.23,6.9C1.94,7.34 2.03,7.94 2.4,8.32L2.4,8.32L8.53,14.45C8.92,14.83 9.51,14.93 9.95,14.64L14.28,11.75C14.82,11.38 15.03,10.69 14.81,10.09L14.81,10.08L12.91,5.16C12.7,4.56 12.06,4.17 11.43,4.17H9.25L7.72,2.95Z"/></svg>
);
export const RazorToolIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.41,8.66L13,10.07L15.59,12.66L18.17,10.07L16.76,8.66M5,18L10.07,12.93L12.66,15.51L7.59,20.59H5V18M9.24,5.24L12,8L10.07,9.93L7.34,7.2L9.24,5.24M5.83,11.5L3.24,8.91L4.66,7.5L7.24,10.09L5.83,11.5Z" /></svg>
);

export const SkipStartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M16,16.5V7.5L11,12M7,18V6H5V18H7Z" /></svg>
);
export const StepBackwardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M18,15.5V8.5H16V15.5H18M14,15.5V8.5L8.5,12L14,15.5Z" /></svg>
);
export const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg>
);
export const StepForwardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M6,15.5V8.5H8V15.5H6M10,15.5V8.5L15.5,12L10,15.5Z" /></svg>
);
export const SkipEndIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M8,7.5V16.5L13,12M17,6V18H19V6H17Z" /></svg>
);
export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>
);
export const MagnetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M3,7V13A4,4 0 0,0 7,17H8V21L12,18L16,21V17H17A4,4 0 0,0 21,13V7H17V13H18V7H15V13H16V7H8V13H9V7H6V13H7V7H3Z" /></svg>
);
export const LinkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M17,18H15V16H17M13,18H11V16H13M9,18H7V16H9M13.5,13H11.5L10.5,15H8.5L12.5,7L16.5,15H14.5L13.5,13M13,11.3L12,9L11,11.3H13Z" /></svg>
);

export const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" /></svg>
);
export const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" /></svg>
);
export const MicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" /></svg>
);


// Data for Timeline
export const TIMELINE_TRACKS: Track[] = [
    {
        id: 'V2',
        type: 'video',
        clips: [],
        locked: false,
    },
    {
        id: 'V1',
        type: 'video',
        clips: [
            { id: 'v1-1', name: 'us-flag.mp4', type: 'video', start: 40, duration: 150, source: '' }
        ],
        locked: true,
    },
    {
        id: 'A1',
        type: 'audio',
        clips: [
            { id: 'a1-1', name: 'upbeat-music.mp3', type: 'audio', start: 30, duration: 180, source: '' }
        ],
        muted: false,
    },
    {
        id: 'A2',
        type: 'audio',
        clips: [],
        muted: true,
        solo: false,
    }
];