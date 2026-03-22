import React from 'react';
import { Dumbbell } from 'lucide-react';

export const SplashScreen: React.FC = () => (
  <div 
    className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center animate-fade-in"
  >
    <div
      className="w-24 h-24 bg-[#d4af37] rounded-[2rem] flex items-center justify-center shadow-2xl shadow-[#d4af37]/40 mb-6 animate-pulse"
    >
      <Dumbbell className="text-black w-12 h-12" />
    </div>
    <h1 
      className="text-3xl font-black tracking-tighter italic text-white"
    >
      PROTOCOLLO 2.0
    </h1>
    <div 
      className="h-1 bg-[#d4af37] mt-4 rounded-full w-[100px]"
    />
  </div>
);
