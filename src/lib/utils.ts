/**
 * Brzycki Formula for calculating 1RM
 */
export const calculate1RM = (weight: number, reps: number): number => {
  if (!weight || !reps || isNaN(weight) || isNaN(reps) || reps <= 0) return 0;
  if (reps === 1) return Math.round(weight);
  return Math.round(weight / (1.0278 - 0.0278 * reps));
};

/**
 * Formats a date string or Timestamp to a readable format
 */
export const formatDate = (date: any): string => {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * Checks if the app is running in standalone mode (iOS PWA)
 */
export const isStandalone = (): boolean => {
  return (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
};
