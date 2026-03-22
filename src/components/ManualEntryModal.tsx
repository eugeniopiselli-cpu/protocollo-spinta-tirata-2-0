import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronDown, Save } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { WorkoutSession, SavedWorkout } from '../data';

export const ManualEntryModal = ({ isOpen, onClose, onSave, user, history, workoutPlan }: { isOpen: boolean, onClose: () => void, onSave: (workout: any) => Promise<any>, user: User, history: SavedWorkout[], workoutPlan: WorkoutSession[] }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSessionIdx, setSelectedSessionIdx] = useState(0);
  const [exercisesData, setExercisesData] = useState<{ [exId: string]: { sets: { weight: string, reps: string, rpe: string, quality: string }[], notes: string } }>({});

  const session = workoutPlan[selectedSessionIdx];

  useEffect(() => {
    const initialData: any = {};
    session.exercises.forEach(ex => {
      initialData[ex.id] = {
        sets: Array(ex.sets).fill(null).map(() => ({ weight: '', reps: '', rpe: '', quality: 'Buona' })),
        notes: ''
      };
    });
    setExercisesData(initialData);
  }, [selectedSessionIdx, session]);

  const handleSave = async () => {
    const selectedDate = new Date(date);
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    
    if (selectedDate > now) {
      alert("Non puoi inserire un allenamento nel futuro!");
      return;
    }
    if (selectedDate < oneYearAgo) {
      alert("La data inserita è troppo lontana nel passato. Controlla l'anno!");
      return;
    }

    const exercisesToSave = session.exercises.map(ex => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      notes: exercisesData[ex.id]?.notes || '',
      sets: exercisesData[ex.id]?.sets
        .filter(s => s.weight && s.reps)
        .map(s => ({ 
          weight: parseFloat(s.weight.toString().replace(',', '.')), 
          reps: parseInt(s.reps.toString()),
          rpe: parseInt(s.rpe) || 0,
          quality: s.quality || 'Buona'
        }))
    })).filter(ex => ex.sets.length > 0);

    if (exercisesToSave.length === 0) {
      alert("Inserisci almeno una serie!");
      return;
    }

    const isDuplicate = history.some(w => {
      const wDate = w.date instanceof Timestamp ? w.date.toDate() : new Date(w.date);
      const sDate = new Date(date);
      wDate.setHours(0, 0, 0, 0);
      sDate.setHours(0, 0, 0, 0);
      return w.sessionId === session.id && wDate.getTime() === sDate.getTime();
    });

    if (isDuplicate) {
      if (!window.confirm("Esiste già un allenamento salvato per questa data e sessione. Vuoi salvarne un altro?")) {
        return;
      }
    }

    await onSave({
      userId: user.uid,
      sessionId: session.id,
      sessionName: session.name,
      date: Timestamp.fromDate(new Date(date)),
      exercises: exercisesToSave
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#0a0a0a] border border-[#d4af37]/30 w-full max-w-lg rounded-[2rem] p-6 space-y-6 my-auto"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black italic gold-text tracking-tighter">INSERIMENTO MANUALE</h2>
          <button onClick={onClose} className="p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Data Allenamento</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm font-bold outline-none focus:border-[#d4af37] transition-all text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Sessione</label>
            <div className="relative">
              <select 
                value={selectedSessionIdx}
                onChange={(e) => setSelectedSessionIdx(parseInt(e.target.value))}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm font-bold outline-none focus:border-[#d4af37] transition-all appearance-none"
              >
                {workoutPlan.map((s, idx) => (
                  <option key={s.id} value={idx}>{s.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-6 pt-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {session.exercises.map(ex => (
              <div key={ex.id} className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4 space-y-4">
                <h4 className="font-black text-[10px] uppercase tracking-widest text-[#d4af37]">{ex.name}</h4>
                <div className="space-y-2">
                  {exercisesData[ex.id]?.sets.map((set, sIdx) => (
                    <div key={sIdx} className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-black text-zinc-600 w-4">{sIdx + 1}</span>
                        <input 
                          type="text" 
                          inputMode="decimal"
                          placeholder="kg"
                          value={set.weight}
                          onChange={(e) => {
                            const newData = { ...exercisesData };
                            newData[ex.id].sets[sIdx].weight = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
                            setExercisesData(newData);
                          }}
                          className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-center outline-none focus:border-[#d4af37]"
                        />
                        <input 
                          type="text" 
                          inputMode="numeric"
                          placeholder="reps"
                          value={set.reps}
                          onChange={(e) => {
                            const newData = { ...exercisesData };
                            newData[ex.id].sets[sIdx].reps = e.target.value.replace(/[^0-9]/g, '');
                            setExercisesData(newData);
                          }}
                          className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-center outline-none focus:border-[#d4af37]"
                        />
                        <input 
                          type="text" 
                          inputMode="numeric"
                          placeholder="rpe"
                          value={set.rpe}
                          onChange={(e) => {
                            const newData = { ...exercisesData };
                            newData[ex.id].sets[sIdx].rpe = e.target.value.replace(/[^0-9]/g, '');
                            setExercisesData(newData);
                          }}
                          className="w-12 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-center outline-none focus:border-[#d4af37]"
                        />
                      </div>
                      <div className="flex gap-1">
                        {(['Meh', 'Buona', 'Ottima'] as const).map((q) => (
                          <button
                            key={q}
                            onClick={() => {
                              const newData = { ...exercisesData };
                              newData[ex.id].sets[sIdx].quality = q;
                              setExercisesData(newData);
                            }}
                            className={`flex-1 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest border transition-all ${
                              set.quality === q 
                                ? 'bg-[#d4af37] text-black border-[#d4af37]' 
                                : 'bg-zinc-900/50 text-zinc-600 border-zinc-800'
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <textarea 
                    placeholder="Note esercizio..."
                    value={exercisesData[ex.id]?.notes || ''}
                    onChange={(e) => {
                      const newData = { ...exercisesData };
                      newData[ex.id].notes = e.target.value;
                      setExercisesData(newData);
                    }}
                    className="w-full bg-black/50 border border-zinc-800 rounded-lg p-3 text-[10px] h-16 outline-none focus:border-[#d4af37] transition-all resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-[#d4af37] text-black font-black py-4 rounded-2xl shadow-xl shadow-[#d4af37]/10 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          SALVA ALLENAMENTO
        </button>
      </motion.div>
    </motion.div>
  );
};
