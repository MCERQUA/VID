
import React from 'react';
import { DeviceIcon, RefreshIcon, FullscreenIcon } from '../constants';


const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between h-14 px-4 bg-[#252526] border-b border-zinc-700 flex-shrink-0 z-10">
      <div className="flex items-center space-x-2">
        <div className="flex items-center bg-zinc-700 rounded-md p-0.5">
          <button className="px-3 py-1 text-sm bg-zinc-800 rounded-sm">Preview</button>
          <button className="px-3 py-1 text-sm text-gray-400">Code</button>
        </div>
        <button className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-400 hover:text-white">
          <FullscreenIcon className="w-4 h-4" />
          <span>Full screen</span>
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-white">
            <DeviceIcon className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white">
            <RefreshIcon className="w-5 h-5" />
        </button>
        <button className="px-5 py-1.5 text-sm font-semibold text-white bg-zinc-700 rounded-md hover:bg-zinc-600 transition-colors">
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
