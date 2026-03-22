import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Upload, 
  Download, 
  ChevronDown, 
  Filter,
  Activity,
  Target,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { User } from 'firebase/auth';
import { WorkoutSession, SavedWorkout } from '../data';
import { ManualEntryModal } from './ManualEntryModal';

const ChartContainer: React.FC<{ title: string, data: any[], dataKey: string, color: string }> = ({ title, data, dataKey, color }) => (
  <div className="hardware-card p-6 space-y-4 bg-black/40 border border-[#d4af37]/10">
    <div className="flex justify-between items-end">
      <div className="space-y-1">
        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono leading-none">
            {data[data.length - 1][dataKey]}
          </span>
          <span className="text-[10px] font-black text-zinc-600 uppercase">
            {dataKey === 'volume' ? 'kg*reps' : dataKey === 'rpe' ? 'rpe' : dataKey === 'quality' ? 'score' : 'kg'}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[8px] uppercase font-black tracking-widest text-zinc-600 mb-1">Trend</p>
        <div className={`text-xs font-black font-mono ${data.length > 1 && data[data.length-1][dataKey] >= data[data.length-2][dataKey] ? 'text-emerald-500' : 'text-red-500'}`}>
          {data.length > 1 ? (data[data.length-1][dataKey] >= data[data.length-2][dataKey] ? '+' : '') : ''}
          {data.length > 1 ? (data[data.length-1][dataKey] - data[data.length-2][dataKey]).toFixed(1) : '0.0'}
        </div>
      </div>
    </div>
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#333" 
            fontSize={8} 
            tickLine={false} 
            axisLine={false} 
            dy={10} 
            fontFamily="JetBrains Mono"
          />
          <YAxis 
            stroke="#333" 
            fontSize={8} 
            tickLine={false} 
            axisLine={false} 
            fontFamily="JetBrains Mono"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#000', 
              border: '1px solid #d4af37', 
              borderRadius: '8px', 
              fontSize: '10px',
              fontFamily: 'JetBrains Mono',
              fontWeight: 'bold'
            }}
            itemStyle={{ color: '#d4af37' }}
            cursor={{ stroke: '#d4af37', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            fillOpacity={1} 
            fill={`url(#color${dataKey})`} 
            strokeWidth={3} 
            dot={{ fill: '#000', stroke: color, strokeWidth: 2, r: 3 }} 
            activeDot={{ r: 5, strokeWidth: 0, fill: color }} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const DashboardView = ({ 
  history, 
  onSeed, 
  user, 
  workoutPlan,
  onSaveWorkout,
  onBulkImport
}: { 
  history: SavedWorkout[], 
  onSeed: () => void, 
  user: User, 
  workoutPlan: WorkoutSession[],
  onSaveWorkout: (workout: any) => Promise<any>,
  onBulkImport: (workouts: any[]) => Promise<any>
}) => {
  const [viewMode, setViewMode] = useState<'exercise' | 'session'>('exercise');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>(workoutPlan[0]?.id || '');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const allExercises = useMemo(() => {
    const map = new Map<string, string>();
    workoutPlan.forEach(session => {
      session.exercises.forEach(ex => {
        map.set(ex.id, ex.name);
      });
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [workoutPlan]);

  const exerciseData = useMemo(() => {
    if (!selectedExerciseId) return [];
    return history
      .filter(w => w.exercises.some(e => e.exerciseId === selectedExerciseId))
      .map(w => {
        const ex = w.exercises.find(e => e.exerciseId === selectedExerciseId)!;
        const bestSet = [...ex.sets].sort((a, b) => b.weight - a.weight)[0];
        const volume = ex.sets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
        const avgRPE = ex.sets.reduce((acc, s) => acc + (s.rpe || 0), 0) / ex.sets.length;
        const qualityScore = ex.sets.reduce((acc, s) => {
          if (s.quality === 'Ottima') return acc + 3;
          if (s.quality === 'Buona') return acc + 2;
          return acc + 1;
        }, 0) / ex.sets.length;

        return {
          date: new Date(w.date.toDate()).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
          weight: bestSet.weight,
          volume: volume,
          rpe: parseFloat(avgRPE.toFixed(1)),
          quality: parseFloat(qualityScore.toFixed(1))
        };
      })
      .reverse();
  }, [history, selectedExerciseId]);

  return (
    <div className="space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-black italic gold-text tracking-tighter uppercase">Dashboard</h2>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Analisi della performance</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[#d4af37] hover:bg-zinc-800 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex gap-2 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <button 
            onClick={() => setViewMode('exercise')}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'exercise' ? 'bg-[#d4af37] text-black' : 'text-zinc-500'}`}
          >
            Esercizio
          </button>
          <button 
            onClick={() => setViewMode('session')}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'session' ? 'bg-[#d4af37] text-black' : 'text-zinc-500'}`}
          >
            Sessione
          </button>
        </div>

        {viewMode === 'exercise' && (
          <div className="space-y-6">
            <div className="relative">
              <select 
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#d4af37] transition-all appearance-none"
              >
                <option value="">Seleziona Esercizio...</option>
                {allExercises.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>

            {selectedExerciseId && exerciseData.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                <ChartContainer 
                  title="Carico Massimale (Best Set)" 
                  data={exerciseData} 
                  dataKey="weight" 
                  color="#d4af37" 
                />
                <ChartContainer 
                  title="Volume Totale (kg*reps)" 
                  data={exerciseData} 
                  dataKey="volume" 
                  color="#10b981" 
                />
                <ChartContainer 
                  title="Intensità Percepita (Avg RPE)" 
                  data={exerciseData} 
                  dataKey="rpe" 
                  color="#f59e0b" 
                />
                <ChartContainer 
                  title="Qualità Tecnica (Score)" 
                  data={exerciseData} 
                  dataKey="quality" 
                  color="#8b5cf6" 
                />
              </div>
            ) : selectedExerciseId ? (
              <div className="hardware-card p-12 text-center space-y-4">
                <Activity className="w-12 h-12 text-zinc-800 mx-auto" />
                <p className="text-zinc-500 text-xs uppercase font-black tracking-widest">Nessun dato per questo esercizio</p>
              </div>
            ) : null}
          </div>
        )}

        {viewMode === 'session' && (
          <div className="hardware-card p-12 text-center space-y-4">
            <Target className="w-12 h-12 text-zinc-800 mx-auto" />
            <p className="text-zinc-500 text-xs uppercase font-black tracking-widest">Analisi sessione in arrivo...</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={onSeed}
          className="flex flex-col items-center gap-3 p-6 bg-zinc-900/30 border border-zinc-800 rounded-[2rem] hover:bg-zinc-900/50 transition-all group"
        >
          <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Genera Dati</span>
        </button>
        <button 
          onClick={() => setIsBulkModalOpen(true)}
          className="flex flex-col items-center gap-3 p-6 bg-zinc-900/30 border border-zinc-800 rounded-[2rem] hover:bg-zinc-900/50 transition-all group"
        >
          <div className="p-3 bg-[#d4af37]/10 rounded-2xl group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6 text-[#d4af37]" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Importa CSV</span>
        </button>
      </div>

      <ManualEntryModal 
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSave={onSaveWorkout}
        user={user}
        history={history}
        workoutPlan={workoutPlan}
      />
      {/* BulkImportModal logic should be here too if needed */}
    </div>
  );
};
