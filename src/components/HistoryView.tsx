import React from 'react';
import { History, Trash2, Calendar } from 'lucide-react';
import { SavedWorkout } from '../data';
import { formatDate } from '../lib/utils';

export const HistoryView = ({ 
  history, 
  onDelete 
}: { 
  history: SavedWorkout[], 
  onDelete: (id: string) => Promise<void> 
}) => {
  return (
    <div className="space-y-8 pb-24">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black italic gold-text tracking-tighter uppercase">Cronologia</h2>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">I tuoi successi passati</p>
      </div>

      <div className="space-y-4">
        {history.map((w) => (
          <div key={w.id} className="hardware-card p-6 flex justify-between items-center group hover:bg-zinc-900/50 transition-all border border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
                <Calendar className="w-5 h-5 text-[#d4af37]" />
              </div>
              <div>
                <div className="text-lg font-black italic tracking-tight uppercase gold-text leading-none mb-1">
                  {w.sessionName}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  {formatDate(w.date)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-mono text-zinc-500">{w.exercises.length} Esercizi</div>
                <div className="text-[10px] text-zinc-700 font-black uppercase mt-1">Completato</div>
              </div>
              <button 
                onClick={() => onDelete(w.id)}
                className="p-3 text-zinc-700 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <div className="text-center py-12 hardware-card border-dashed border-zinc-800">
            <History className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-600 text-[10px] uppercase font-black tracking-widest">Nessun allenamento salvato</p>
          </div>
        )}
      </div>
    </div>
  );
};
