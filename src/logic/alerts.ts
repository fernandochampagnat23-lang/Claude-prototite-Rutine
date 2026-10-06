import type { Symptom } from '../types';

export type AlertLevel = 'none' | 'specialist' | 'emergency';

/** Síntomas que indican ir a urgencias. */
export const EMERGENCY_SYMPTOMS: Symptom[] = ['debilidad', 'esfinteres', 'entrepierna'];
/** Síntomas que indican adelantar la cita con el especialista. */
export const SPECIALIST_SYMPTOMS: Symptom[] = ['hormigueo', 'adormecimiento_pierna'];

export function alertLevel(symptoms: readonly Symptom[]): AlertLevel {
  if (symptoms.some((s) => EMERGENCY_SYMPTOMS.includes(s))) return 'emergency';
  if (symptoms.some((s) => SPECIALIST_SYMPTOMS.includes(s))) return 'specialist';
  return 'none';
}

export const ALERT_MESSAGES: Record<Exclude<AlertLevel, 'none'>, { title: string; body: string }> = {
  emergency: {
    title: 'Ve a urgencias ahora',
    body: 'Registraste un síntoma que requiere atención médica inmediata. Deja de entrenar y acude a urgencias o llama al número de emergencias de tu país.',
  },
  specialist: {
    title: 'Adelanta la cita con el especialista',
    body: 'Registraste hormigueo o adormecimiento en la pierna. Pide adelantar la consulta con tu especialista y coméntale cuándo aparece.',
  },
};
