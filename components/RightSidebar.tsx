
import React, { useState } from 'react';
import { PROPERTIES_TABS, PropertyGroup } from '../constants';

const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-700">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full p-3 text-sm font-semibold text-left hover:bg-zinc-700/50">
        <span className="uppercase">{title}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
      {isOpen && <div className="p-3 bg-zinc-900/30">{children}</div>}
    </div>
  );
};

const PropertyInput: React.FC<{ label: string; value: string; isLinked?: boolean }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5 text-sm">
    <label className="text-gray-400">{label}</label>
    <div className="flex items-center space-x-3">
      <span className="font-mono text-blue-400 cursor-pointer hover:underline">{value}</span>
      <svg className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.182-3.182m0-4.991v4.99" /></svg>
      <svg className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928z" /></svg>
    </div>
  </div>
);

const RightSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Properties');
  
  const renderPanelContent = () => {
    switch (activeTab) {
      case 'Properties':
        return (
          <>
            <div className="p-3 border-b border-zinc-700">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
                <span className="text-sm font-semibold">The_woman_pdeeks_202509.mp4</span>
              </div>
            </div>
            {PropertyGroup.map(group => (
              <Accordion key={group.title} title={group.title} defaultOpen={true}>
                <div className="space-y-1">
                  {group.properties.map(prop => (
                    <PropertyInput key={prop.label} label={prop.label} value={prop.value} isLinked={prop.isLinked} />
                  ))}
                </div>
              </Accordion>
            ))}
          </>
        );
      default:
        return <div className="p-4 text-center">Content for {activeTab}</div>;
    }
  };

  return (
    <aside className="w-[320px] bg-[#252526] flex-shrink-0 border-l border-zinc-700 flex flex-col">
      <div className="flex border-b border-zinc-700">
        {PROPERTIES_TABS.map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium flex-1 ${activeTab === tab ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:bg-zinc-700/50'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {renderPanelContent()}
      </div>
    </aside>
  );
};

export default RightSidebar;
