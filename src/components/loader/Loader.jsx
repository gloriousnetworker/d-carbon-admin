import React from 'react';

function Loader() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full p-1 animate-rotate"
          style={{
            background: 'conic-gradient(from 0deg, #039994 0%, #03999400 50%, #039994 100%)',
          }}
        >
          <div className="w-full h-full bg-white rounded-full animate-beep opacity-90"></div>
        </div>
      </div>
      
      <div className="font-sfpro text-[16px] font-medium text-[#039994] tracking-[-0.05em]">
        Please wait
        <span className="animate-dot-1">.</span>
        <span className="animate-dot-2">.</span>
        <span className="animate-dot-3">.</span>
      </div>
    </div>
  );
}

export default Loader;