
import type React from 'react';

export interface AssetCategory {
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface Template {
  id: number;
  name: string;
  thumbnailUrl: string;
}

export interface Property {
    label: string;
    value: string;
    isLinked?: boolean;
}

export interface Clip {
    id: string;
    name: string;
    type: 'video' | 'audio';
    start: number;
    duration: number;
    source: string;
}

export interface Track {
    id: string;
    type: 'video' | 'audio';
    clips: Clip[];
    muted?: boolean;
    solo?: boolean;
    locked?: boolean;
}