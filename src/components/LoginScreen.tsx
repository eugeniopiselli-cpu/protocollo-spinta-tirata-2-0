import React from 'react';
import { Dumbbell, LogIn, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginScreen: React.FC<{ onSignIn: () => void | Promise<any>, isInsideIframe: boolean }> = ({ onSignIn, isInsideIframe }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center"
  >
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-20 h-20 bg-[#d4af37] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#d4af37]/20 mb-8"
    >
      <Dumbbell className="text-black w-10 h-10" />
    </motion.div>
    <h1 className="text-3xl font-black tracking-tighter mb-2 italic gold-text">PROTOCOLLO 2.0</h1>
    <p className="text-zinc-500 mb-8 max-w-xs">Accedi per salvare i tuoi progressi e visualizzare i grafici di crescita.</p>
    
    <div className="w-full max-w-xs space-y-4">
      <button 
        onClick={onSignIn}
        className="w-full bg-[#d4af37] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#c4a030] transition-all active:scale-95 shadow-xl shadow-[#d4af37]/10"
      >
        <LogIn className="w-5 h-5" />
        Accedi con Google
      </button>

      {isInsideIframe && (
        <div className="pt-4 space-y-4">
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
            <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-2">Problemi con l'accesso?</p>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4">Safari blocca l'accesso se sei dentro l'anteprima. Aprila nel browser per continuare.</p>
            <button 
              onClick={() => window.open(window.location.href, '_blank')}
              className="w-full bg-zinc-800 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              Apri in Safari / Chrome
            </button>
          </div>
        </div>
      )}
    </div>
  </motion.div>
);
