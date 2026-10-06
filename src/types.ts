/** Cómo se mide un ejercicio: repeticiones, segundos de aguante o metros recorridos. */
export type ExerciseKind = 'reps' | 'hold' | 'distance';

export type MuscleGroup =
  | 'pecho'
  | 'hombro'
  | 'triceps'
  | 'espalda'
  | 'biceps'
  | 'cuadriceps'
  | 'isquios'
  | 'gluteo'
  | 'pantorrilla'
  | 'core'
  | 'cardio';

export interface Exercise {
  id: string;
  name: string;
  kind: ExerciseKind;
  group: MuscleGroup;
  /** Si se registra peso (kg) en cada serie. */
  weighted: boolean;
  /** El peso es asistencia (menos peso = más difícil), como en dominadas asistidas. */
  assisted?: boolean;
  /** Clave de técnica corta. */
  technique: string;
  /** Ruta relativa dentro de /public (por ejemplo "exercises/press-pecho-maquina.png"). */
  image?: string;
  /** Ids de alternativas seguras. */
  alternatives: string[];
}

export interface RoutineItem {
  /** Identificador único dentro del día (no cambia al reemplazar el ejercicio). */
  uid: string;
  exerciseId: string;
  sets: number;
  /** Reps, segundos o metros según el tipo de ejercicio. */
  target: number;
  perSide?: boolean;
  /** Los ítems con el mismo grupo forman una superserie. */
  supersetGroup?: string;
  optional?: boolean;
  note?: string;
}

export interface RoutineDay {
  id: number;
  title: string;
  items: RoutineItem[];
}

export type PainLocation = 'lumbar' | 'gluteo_izq' | 'muslo_izq' | 'pantorrilla_pie_izq';

export type Symptom =
  | 'hormigueo'
  | 'adormecimiento_pierna'
  | 'debilidad'
  | 'esfinteres'
  | 'entrepierna';

export type Trigger = 'estres' | 'mochila' | 'movimiento_brusco' | 'mala_noche';

export interface PainCheck {
  score: number;
  locations: PainLocation[];
  symptoms: Symptom[];
  at: number;
}

export type SessionStep = 'pre' | 'warmup' | 'exercises' | 'post';

export interface Session {
  id?: number;
  /** Fecha local YYYY-MM-DD. */
  date: string;
  startedAt: number;
  finishedAt?: number;
  dayId: number;
  dayTitle: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  step: SessionStep;
  /** Copia de los ítems del día al empezar, para que editar la rutina no altere el historial. */
  items: RoutineItem[];
  /** Ítems marcados como omitidos (opcionales). */
  skipped: string[];
  /** Claves de series del calentamiento ya hechas. */
  warmupDone: string[];
  pre?: PainCheck;
  post?: PainCheck;
  triggers: Trigger[];
  notes: string;
  walkMinutes?: number;
  /** Regla de oro por sesión: dolor post ≥ dolor inicial + 2. */
  goldenRule?: boolean;
  /** Ejercicios señalados como sospechosos cuando se activa la regla de oro. */
  suspects: string[];
}

export interface SetLog {
  id?: number;
  sessionId: number;
  itemUid: string;
  exerciseId: string;
  setIndex: number;
  weight?: number;
  /** Reps, segundos o metros hechos. */
  value?: number;
  done: boolean;
  at: number;
}

export interface PainEvent {
  id?: number;
  sessionId?: number;
  exerciseId: string;
  radiatesToLeg: boolean;
  date: string;
  at: number;
}

/** Registro de dolor o síntomas fuera de una sesión (por ejemplo, en un día de descanso). */
export interface CheckIn {
  id?: number;
  date: string;
  at: number;
  score: number;
  locations: PainLocation[];
  symptoms: Symptom[];
  triggers: Trigger[];
  note: string;
}

/** Ejercicio marcado en rojo hasta que se reemplaza o se descarta la marca. */
export interface ExerciseFlag {
  exerciseId: string;
  reason: 'pierna' | 'regla_de_oro';
  date: string;
  at: number;
  sessionId?: number;
}

export interface Settings {
  key: 'app';
  restSeconds: number;
  /** Duración de cada aguante del calentamiento McGill. */
  holdSeconds: number;
  reminderEnabled: boolean;
  reminderTime: string;
  /** Fecha (YYYY-MM-DD) en que se cerró el aviso matutino. */
  reminderDismissedOn?: string;
  /** Inicio de la racha para la cual ya se cerró el aviso de fase siguiente. */
  phaseNoticeDismissedFor?: string;
}
