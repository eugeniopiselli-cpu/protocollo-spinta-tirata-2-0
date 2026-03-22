import React, { useState, useEffect } from 'react';
import { Timer, Pause, Play, RotateCcw } from 'lucide-react';

export const TimerComponent = ({ initialSeconds, autoStartKey }: { initialSeconds: string, autoStartKey?: number }) => {
  const parseSeconds = (s: string) => {
    const match = s.match(/(\d+)/);
    if (!match) return 60;
    return parseInt(match[1]) * 60;
  };

  const [seconds, setSeconds] = useState(parseSeconds(initialSeconds));
  const [isActive, setIsActive] = useState(false);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio beep failed", e);
    }
  };

  useEffect(() => {
    if (autoStartKey) {
      setSeconds(parseSeconds(initialSeconds));
      setIsActive(true);
    }
  }, [autoStartKey]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      clearInterval(interval);
      if (isActive) playBeep();
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setSeconds(parseSeconds(initialSeconds));
    setIsActive(false);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
      <Timer className="w-4 h-4 text-emerald-500" />
      <span className={`font-mono text-sm ${seconds === 0 ? 'text-red-500 animate-pulse' : 'text-zinc-300'}`}>
        {formatTime(seconds)}
      </span>
      <div className="flex gap-1">
        <button onClick={toggle} className="p-1 hover:bg-zinc-800 rounded transition-colors">
          {isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>
        <button onClick={reset} className="p-1 hover:bg-zinc-800 rounded transition-colors">
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
