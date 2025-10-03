
import React from 'react';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import CenterPanel from './components/CenterPanel';
import RightSidebar from './components/RightSidebar';
import Timeline from './components/Timeline';

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-gray-300 font-sans overflow-hidden">
      <Header />
      <div className="flex flex-1 min-h-0">
        <LeftSidebar />
        <CenterPanel />
        <RightSidebar />
      </div>
      <Timeline />
    </div>
  );
};

export default App;
