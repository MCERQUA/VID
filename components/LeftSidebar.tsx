
import React from 'react';
import { ASSET_CATEGORIES, TEMPLATE_FILTERS, MOCK_TEMPLATES } from '../constants';
import type { Template } from '../types';

const AssetGrid: React.FC<{ templates: Template[] }> = ({ templates }) => (
  <div className="grid grid-cols-2 gap-3 p-4">
    {templates.map((template) => (
      <div key={template.id} className="relative aspect-[9/16] bg-zinc-700 rounded-lg overflow-hidden group cursor-pointer">
        <img src={template.thumbnailUrl} alt={template.name} className="object-cover w-full h-full" />
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
    ))}
  </div>
);

const LeftSidebar: React.FC = () => {
  return (
    <aside className="w-[300px] bg-[#252526] flex-shrink-0 border-r border-zinc-700 flex flex-col">
       <div className="p-3 border-b border-zinc-700 flex flex-col space-y-3">
         <div className="flex items-center space-x-2">
            {ASSET_CATEGORIES.map(cat => (
                <button key={cat.name} className="flex flex-col items-center p-2 rounded-md hover:bg-zinc-700 space-y-1 w-16">
                    <cat.icon className="w-6 h-6"/>
                    <span className="text-xs">{cat.name}</span>
                </button>
            ))}
         </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search templates"
              className="w-full py-2 pl-10 pr-4 text-sm bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {TEMPLATE_FILTERS.map(filter => (
               <button key={filter} className="px-3 py-1 text-sm bg-zinc-700 rounded-md hover:bg-zinc-600 whitespace-nowrap">{filter}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <AssetGrid templates={MOCK_TEMPLATES} />
        </div>
    </aside>
  );
};

export default LeftSidebar;
