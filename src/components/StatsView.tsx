import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Activity, 
  Trash2, 
  Plus, 
  Save,
  LayoutDashboard,
  Loader2
} from 'lucide-react';
import { WorkoutSession, Exercise } from '../data';

export const SocialView = ({ onShare }: { onShare: () => void }) => {
  const handleFixApp = async () => {
    if (window.confirm("Questa azione pulirà la cache dell'app e proverà a risolvere i problemi di caricamento. L'app verrà riavviata. Vuoi procedere?")) {
      try {
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map(r => r.unregister()));
        }
        window.location.reload();
      } catch (e) {
        console.error(e);
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black italic gold-text tracking-tighter uppercase">Community</h2>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Allenati insieme ai tuoi amici</p>
      </div>

      <div className="hardware-card p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto border border-[#d4af37]/20">
          <Share2 className="w-10 h-10 text-[#d4af37]" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black italic tracking-tight uppercase">Invita un Amico</h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Condividi l'app con i tuoi compagni di allenamento. Presto potrai vedere i loro progressi e sfidarli!
          </p>
        </div>
        <button 
          onClick={onShare}
          className="w-full gold-gradient text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase italic text-sm tracking-tighter shadow-[0_0_30px_rgba(212,175,55,0.3)]"
        >
          <Copy className="w-5 h-5" />
          Copia Link Invito
        </button>
      </div>

      <div className="hardware-card p-6 border border-red-500/20 bg-red-500/5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Activity className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-sm font-black uppercase italic tracking-tight">Problemi con l'App?</h3>
        </div>
        <p className="text-[10px] text-zinc-500 leading-relaxed uppercase font-bold">
          Se l'app non si apre correttamente dalla Home o sembra bloccata, prova a forzare un ripristino.
        </p>
        <button 
          onClick={handleFixApp}
          className="w-full bg-zinc-900 text-red-500 font-black py-3 rounded-xl border border-zinc-800 text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-all"
        >
          Ripristina App (Fix Home)
        </button>
      </div>
    </div>
  );
};

export const PlanEditor = ({ plan, onSave, isSaving }: { plan: WorkoutSession[], onSave: (newPlan: WorkoutSession[]) => Promise<void>, isSaving: boolean }) => {
  const [editedPlan, setEditedPlan] = useState<WorkoutSession[]>(JSON.parse(JSON.stringify(plan)));

  const handleAddSession = () => {
    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      name: "NUOVA SESSIONE",
      exercises: []
    };
    setEditedPlan([...editedPlan, newSession]);
  };

  const handleRemoveSession = (idx: number) => {
    if (window.confirm("Sei sicuro di voler eliminare questa sessione?")) {
      const newPlan = [...editedPlan];
      newPlan.splice(idx, 1);
      setEditedPlan(newPlan);
    }
  };

  const handleAddExercise = (sessionIdx: number) => {
    const newExercise: Exercise = {
      id: `ex-${Date.now()}`,
      name: "Nuovo Esercizio",
      sets: 3,
      reps: "8-10",
      rest: "2-3'",
      buffer: "0-2"
    };
    const newPlan = [...editedPlan];
    newPlan[sessionIdx].exercises.push(newExercise);
    setEditedPlan(newPlan);
  };

  const handleRemoveExercise = (sessionIdx: number, exIdx: number) => {
    const newPlan = [...editedPlan];
    newPlan[sessionIdx].exercises.splice(exIdx, 1);
    setEditedPlan(newPlan);
  };

  const updateExercise = (sessionIdx: number, exIdx: number, field: keyof Exercise, value: any) => {
    const newPlan = [...editedPlan];
    const ex = newPlan[sessionIdx].exercises[exIdx];
    (ex as any)[field] = value;
    setEditedPlan(newPlan);
  };

  const updateSessionName = (idx: number, name: string) => {
    const newPlan = [...editedPlan];
    newPlan[idx].name = name;
    setEditedPlan(newPlan);
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black italic gold-text tracking-tighter uppercase">Gestione Scheda</h2>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Personalizza i tuoi allenamenti</p>
      </div>

      <div className="space-y-6">
        {editedPlan.map((session, sIdx) => (
          <div key={session.id} className="hardware-card p-6 space-y-4 border border-zinc-800">
            <div className="flex items-center gap-4">
              <input 
                type="text" 
                value={session.name}
                onChange={(e) => updateSessionName(sIdx, e.target.value)}
                className="flex-1 bg-transparent border-b border-zinc-800 focus:border-[#d4af37] outline-none text-lg font-black italic uppercase tracking-tight gold-text py-1"
              />
              <button 
                onClick={() => handleRemoveSession(sIdx)}
                className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {session.exercises.map((ex, eIdx) => (
                <div key={ex.id} className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <input 
                      type="text" 
                      value={ex.name}
                      onChange={(e) => updateExercise(sIdx, eIdx, 'name', e.target.value)}
                      className="flex-1 bg-transparent border-b border-zinc-800 focus:border-[#d4af37] outline-none text-xs font-black uppercase tracking-widest text-white py-1"
                    />
                    <button 
                      onClick={() => handleRemoveExercise(sIdx, eIdx)}
                      className="p-1 text-zinc-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Serie</label>
                      <input 
                        type="number" 
                        value={ex.sets}
                        onChange={(e) => updateExercise(sIdx, eIdx, 'sets', parseInt(e.target.value))}
                        className="w-full bg-black/50 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Reps</label>
                      <input 
                        type="text" 
                        value={ex.reps}
                        onChange={(e) => updateExercise(sIdx, eIdx, 'reps', e.target.value)}
                        className="w-full bg-black/50 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => handleAddExercise(sIdx)}
                className="w-full py-3 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-600 text-[10px] font-black uppercase tracking-widest hover:border-zinc-700 hover:text-zinc-500 transition-all"
              >
                + Aggiungi Esercizio
              </button>
            </div>
          </div>
        ))}
        <button 
          onClick={handleAddSession}
          className="w-full py-6 border-2 border-dashed border-[#d4af37]/20 rounded-[2rem] text-[#d4af37]/40 text-xs font-black uppercase tracking-widest hover:border-[#d4af37]/40 hover:text-[#d4af37]/60 transition-all"
        >
          + Nuova Sessione
        </button>
      </div>

      <div className="fixed bottom-24 left-6 right-6">
        <button 
          onClick={() => onSave(editedPlan)}
          disabled={isSaving}
          className="w-full gold-gradient text-black font-black py-4 rounded-2xl shadow-xl shadow-[#d4af37]/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          SALVA MODIFICHE SCHEDA
        </button>
      </div>
    </div>
  );
};
