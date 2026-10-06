import type { RoutineDay } from '../types';

/** Rutina inicial de 5 días. Se copia a IndexedDB la primera vez y luego se edita desde la app. */
export const DEFAULT_ROUTINE: RoutineDay[] = [
  {
    id: 1,
    title: 'Pecho, hombro y tríceps',
    items: [
      { uid: 'd1-1', exerciseId: 'press-pecho-maquina', sets: 4, target: 10 },
      { uid: 'd1-2', exerciseId: 'press-inclinado-mancuernas', sets: 3, target: 12 },
      { uid: 'd1-3', exerciseId: 'pec-deck', sets: 3, target: 12 },
      { uid: 'd1-4', exerciseId: 'press-hombro-maquina', sets: 3, target: 10 },
      { uid: 'd1-5', exerciseId: 'elevaciones-laterales-sentado', sets: 3, target: 15 },
      { uid: 'd1-6', exerciseId: 'triceps-polea', sets: 3, target: 12 },
      { uid: 'd1-7', exerciseId: 'pallof-press', sets: 3, target: 10, perSide: true },
    ],
  },
  {
    id: 2,
    title: 'Espalda y bíceps',
    items: [
      { uid: 'd2-1', exerciseId: 'jalon-pecho', sets: 4, target: 10 },
      { uid: 'd2-2', exerciseId: 'remo-maquina-apoyo-pecho', sets: 4, target: 10 },
      { uid: 'd2-3', exerciseId: 'remo-mancuerna-una-mano', sets: 3, target: 10, perSide: true },
      { uid: 'd2-4', exerciseId: 'face-pull', sets: 3, target: 15 },
      { uid: 'd2-5', exerciseId: 'curl-banco-inclinado', sets: 3, target: 12 },
      { uid: 'd2-6', exerciseId: 'curl-martillo-sentado', sets: 3, target: 12 },
      { uid: 'd2-7', exerciseId: 'dead-bug', sets: 3, target: 8, perSide: true },
    ],
  },
  {
    id: 3,
    title: 'Pierna (cuádriceps)',
    items: [
      {
        uid: 'd3-1',
        exerciseId: 'prensa',
        sets: 4,
        target: 12,
        note: 'Bajar solo hasta donde la lumbar siga pegada',
      },
      {
        uid: 'd3-2',
        exerciseId: 'belt-squat',
        sets: 3,
        target: 10,
        optional: true,
        note: 'Opcional, si hay máquina',
      },
      { uid: 'd3-3', exerciseId: 'extension-cuadriceps', sets: 3, target: 12 },
      { uid: 'd3-4', exerciseId: 'curl-femoral-sentado', sets: 3, target: 12 },
      { uid: 'd3-5', exerciseId: 'abductores-maquina', sets: 3, target: 15 },
      { uid: 'd3-6', exerciseId: 'pantorrilla-sentado', sets: 4, target: 15 },
      { uid: 'd3-7', exerciseId: 'suitcase-carry', sets: 3, target: 30, perSide: true },
    ],
  },
  {
    id: 4,
    title: 'Torso completo',
    items: [
      { uid: 'd4-1', exerciseId: 'press-inclinado-maquina', sets: 3, target: 10 },
      { uid: 'd4-2', exerciseId: 'remo-polea-sentado', sets: 3, target: 12 },
      { uid: 'd4-3', exerciseId: 'dominadas-asistidas', sets: 3, target: 8 },
      { uid: 'd4-4', exerciseId: 'pec-deck-invertido', sets: 3, target: 15 },
      { uid: 'd4-5', exerciseId: 'biceps-polea', sets: 3, target: 12, supersetGroup: 'A' },
      { uid: 'd4-6', exerciseId: 'triceps-polea', sets: 3, target: 12, supersetGroup: 'A' },
      { uid: 'd4-7', exerciseId: 'plancha-frontal', sets: 3, target: 30 },
    ],
  },
  {
    id: 5,
    title: 'Pierna (glúteo e isquios)',
    items: [
      { uid: 'd5-1', exerciseId: 'hip-thrust', sets: 4, target: 10 },
      { uid: 'd5-2', exerciseId: 'curl-femoral-sentado', sets: 4, target: 12 },
      { uid: 'd5-3', exerciseId: 'prensa-una-pierna', sets: 3, target: 10, perSide: true },
      { uid: 'd5-4', exerciseId: 'patada-gluteo-polea', sets: 3, target: 12, perSide: true },
      { uid: 'd5-5', exerciseId: 'abductores-maquina', sets: 3, target: 15 },
      { uid: 'd5-6', exerciseId: 'plancha-lateral', sets: 3, target: 20, perSide: true },
    ],
  },
];

export const DAY_COUNT = DEFAULT_ROUTINE.length;
