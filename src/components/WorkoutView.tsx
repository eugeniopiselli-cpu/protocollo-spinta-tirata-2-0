import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Info,
  RotateCcw,
  Save,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkoutSession, Exercise, SavedWorkout } from '../data';
import { TimerComponent } from './TimerComponent';

interface SetRecord {
  reps: string;
  weight: string;
  completed: boolean;
  rpe?: string;
  quality?: 'Ottima' | 'Buona' | 'Meh';
}

interface WorkoutLog {
  [exerciseId: string]: {
    sets: SetRecord[];
    notes: string;
  };
}

export const WorkoutView = ({ 
  session, 
  onComplete, 
  onCancel,
  history
}: { 
  session: WorkoutSession, 
  onComplete: (log: WorkoutLog) => Promise<void>,
  onCancel: () => void,
  history: SavedWorkout[]
}) => {
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog>({});
  const [timerKey, setTimerKey] = useState(0);

  const currentEx = session.exercises[currentExIdx];

  useEffect(() => {
    const initialLog: WorkoutLog = {};
    session.exercises.forEach(ex => {
      initialLog[ex.id] = {
        sets: Array(ex.sets).fill(null).map(() => ({ reps: '', weight: '', completed: false, rpe: '', quality: 'Buona' })),
        notes: ''
      };
    });
    setWorkoutLog(initialLog);
  }, [session]);

  const updateSet = (exId: string, setIdx: number, field: keyof SetRecord, value: any) => {
    const newLog = { ...workoutLog };
    (newLog[exId].sets[setIdx] as any)[field] = value;
    setWorkoutLog(newLog);
    if (field === 'completed' && value === true) {
      setTimerKey(prev => prev + 1);
    }
  };

  const detectStagnation = (exId: string) => {
    const exHistory = history
      .filter(w => w.exercises.some(e => e.exerciseId === exId))
      .slice(0, 3);
    
    if (exHistory.length < 3) return null;

    const performance = exHistory.map(w => {
      const ex = w.exercises.find(e => e.exerciseId === exId)!;
      return ex.sets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
    });

    const isStagnant = performance.every((v, i, arr) => i === 0 || Math.abs(v - arr[i-1]) < (arr[i-1] * 0.02));
    
    if (isStagnant) {
      return {
        type: 'Micro-stallo',
        advice: 'Aumenta il carico del 2-5% o prova a cambiare l\'ordine degli esercizi.'
      };
    }
    return null;
  };

  const stagnation = detectStagnation(currentEx.id);

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="p-2 text-zinc-500 hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-black italic gold-text tracking-tighter uppercase">{session.name}</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Esercizio {currentExIdx + 1} di {session.exercises.length}</p>
        </div>
        <div className="w-10" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentEx.id}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          className="space-y-6"
        >
          <div className="hardware-card p-6 space-y-4 border border-[#d4af37]/20">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-2xl font-black italic tracking-tight uppercase leading-none">{currentEx.name}</h3>
                <div className="flex gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{currentEx.sets} Serie</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{currentEx.reps} Reps</span>
                </div>
              </div>
              <TimerComponent initialSeconds={currentEx.rest} autoStartKey={timerKey} />
            </div>

            {stagnation && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 items-start">
                <Activity className="w-4 h-4 text-red-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-red-500">{stagnation.type}</p>
                  <p className="text-[10px] text-zinc-400 leading-tight">{stagnation.advice}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {workoutLog[currentEx.id]?.sets.map((set, idx) => (
                <div key={idx} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${set.completed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-black/40 border-zinc-800'}`}>
                  <span className="w-6 text-center font-black italic text-zinc-600">{idx + 1}</span>
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    <input 
                      type="text" 
                      inputMode="decimal"
                      placeholder="kg"
                      value={set.weight}
                      onChange={(e) => updateSet(currentEx.id, idx, 'weight', e.target.value.replace(',', '.'))}
                      className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-center outline-none focus:border-[#d4af37]"
                    />
                    <input 
                      type="text" 
                      inputMode="numeric"
                      placeholder="reps"
                      value={set.reps}
                      onChange={(e) => updateSet(currentEx.id, idx, 'reps', e.target.value)}
                      className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-center outline-none focus:border-[#d4af37]"
                    />
                    <input 
                      type="text" 
                      inputMode="numeric"
                      placeholder="rpe"
                      value={set.rpe}
                      onChange={(e) => updateSet(currentEx.id, idx, 'rpe', e.target.value)}
                      className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-center outline-none focus:border-[#d4af37]"
                    />
                    <div className="flex gap-1">
                      {(['Meh', 'Buona', 'Ottima'] as const).map((q) => (
                        <button
                          key={q}
                          onClick={() => updateSet(currentEx.id, idx, 'quality', q)}
                          className={`flex-1 py-1 rounded-lg text-[6px] font-black uppercase tracking-widest border transition-all ${set.quality === q ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'bg-zinc-900/50 text-zinc-600 border-zinc-800'}`}
                        >
                          {q[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => updateSet(currentEx.id, idx, 'completed', !set.completed)}
                    className={`p-2 rounded-xl transition-all ${set.completed ? 'text-emerald-500' : 'text-zinc-700'}`}
                  >
                    {set.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              disabled={currentExIdx === 0}
              onClick={() => setCurrentExIdx(prev => prev - 1)}
              className="flex-1 bg-zinc-900 border border-zinc-800 text-white font-black py-4 rounded-2xl disabled:opacity-30 transition-all flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              INDIETRO
            </button>
            {currentExIdx === session.exercises.length - 1 ? (
              <button 
                onClick={() => onComplete(workoutLog)}
                className="flex-[2] gold-gradient text-black font-black py-4 rounded-2xl shadow-xl shadow-[#d4af37]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                FINE ALLENAMENTO
              </button>
            ) : (
              <button 
                onClick={() => setCurrentExIdx(prev => prev + 1)}
                className="flex-[2] bg-white text-black font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                PROSSIMO
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
