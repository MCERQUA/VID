
import React from 'react';
import {
  DeviceIcon,
  RefreshIcon,
  FullscreenIcon,
  PanelsIcon,
  AdjustmentsIcon,
} from '../constants';

type HeaderProps = {
  isMobile: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  leftOpen: boolean;
  rightOpen: boolean;
};

const Header: React.FC<HeaderProps> = ({ isMobile, onToggleLeft, onToggleRight, leftOpen, rightOpen }) => {
  return (
    <header className="flex items-center justify-between h-14 px-4 bg-[#252526] border-b border-zinc-700 flex-shrink-0 z-40">
      <div className="flex items-center space-x-3">
        {isMobile && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onToggleLeft}
              aria-pressed={leftOpen}
              className={`p-2 rounded-md border border-zinc-700 bg-zinc-800 text-gray-300 hover:text-white hover:border-blue-500 ${leftOpen ? 'border-blue-500 text-white' : ''}`}
            >
              <PanelsIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onToggleRight}
              aria-pressed={rightOpen}
              className={`p-2 rounded-md border border-zinc-700 bg-zinc-800 text-gray-300 hover:text-white hover:border-blue-500 ${rightOpen ? 'border-blue-500 text-white' : ''}`}
            >
              <AdjustmentsIcon className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="hidden sm:flex items-center bg-zinc-700 rounded-md p-0.5">
          <button className="px-3 py-1 text-sm bg-zinc-800 rounded-sm">Preview</button>
          <button className="px-3 py-1 text-sm text-gray-400">Code</button>
        </div>
        <button className="hidden md:flex items-center space-x-2 px-3 py-1 text-sm text-gray-400 hover:text-white">
          <FullscreenIcon className="w-4 h-4" />
          <span>Full screen</span>
        </button>
      </div>
      <div className="flex items-center space-x-3">
        <button className="p-2 text-gray-400 hover:text-white hidden md:inline-flex">
            <DeviceIcon className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white hidden md:inline-flex">
            <RefreshIcon className="w-5 h-5" />
        </button>
        <button className="px-4 py-1.5 text-sm font-semibold text-white bg-zinc-700 rounded-md hover:bg-zinc-600 transition-colors hidden sm:inline-flex">
          Save
        </button>
        <img
          src="https://picsum.photos/id/237/40/40"
          alt="User Avatar"
          className="w-8 h-8 rounded-full"
        />
      </div>
    </header>
  );
};

export default Header;
