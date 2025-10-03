
import React from 'react';

const CenterPanel: React.FC = () => {
  return (
    <main className="flex flex-col flex-1 bg-[#2d2d2d] items-center justify-center p-8 overflow-hidden">
      <div className="relative w-full h-full max-w-full max-h-full">
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="relative w-full h-full bg-white rounded-lg shadow-2xl"
            style={{aspectRatio: '16/9'}}
           >
            {/* Movable and resizable items will go here */}
          </div>
        </div>
      </div>
    </main>
  );
};

export default CenterPanel;
