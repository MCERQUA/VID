
import type React from 'react';

export type AssetType = 'character' | 'background' | 'music' | 'graphic';
export type TimelineMode = 'edit' | 'play';

export interface AssetCategory {
  name: string;
  type: AssetType;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface LibraryAsset {
  id: string;
  type: AssetType;
  name: string;
  thumbnailUrl: string;
  mediaUrl: string;
  duration?: number;
  bpm?: number;
}

export interface Transform {
  /** Left position as percentage of the canvas width */
  x: number;
  /** Top position as percentage of the canvas height */
  y: number;
  /** Width as percentage of the canvas width */
  width: number;
  /** Height as percentage of the canvas height */
  height: number;
  rotation: number;
  opacity: number;
  preserveAspectRatio?: boolean;
}

export interface CanvasAsset {
  id: string;
  assetId: string;
  type: Exclude<AssetType, 'music'>;
  name: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  transform: Transform;
  zIndex: number;
  isLocked: boolean;
  isVisible: boolean;
  timeline?: CanvasAssetTimeline;
}

export interface AudioClip {
  id: string;
  assetId: string;
  name: string;
  start: number;
  duration: number;
  source: string;
  volume: number;
  fadeIn?: number;
  fadeOut?: number;
}

export interface AudioTrack {
  id: string;
  clips: AudioClip[];
  muted?: boolean;
  solo?: boolean;
  locked?: boolean;
  name?: string;
}

export type SelectedEntity =
  | { kind: 'canvas'; id: string }
  | { kind: 'audio'; id: string }
  | null;

export interface CanvasAssetTimeline {
  start: number;
  duration: number;
  trackId: string;
  clipId: string;
}

export interface ContentClip {
  id: string;
  assetId: string;
  canvasAssetId: string;
  name: string;
  start: number;
  duration: number;
  type: 'image' | 'video';
  thumbnailUrl?: string;
}

export interface ContentTrack {
  id: string;
  name: string;
  clips: ContentClip[];
  locked?: boolean;
  hidden?: boolean;
}