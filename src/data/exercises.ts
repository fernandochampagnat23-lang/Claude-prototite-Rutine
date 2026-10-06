import type { Exercise, MuscleGroup } from '../types';
import media from './media.json';

/**
 * Catálogo de ejercicios seguros para la columna.
 * Las imágenes y claves de técnica del documento Rutina_Gym_L5.docx se aplican desde media.json
 * (generado por scripts/extract_docx.py). Si falta una, la app muestra un placeholder.
 */
const base: Exercise[] = [
  // Calentamiento: Big 3 de McGill
  {
    id: 'curl-up-mcgill',
    name: 'Curl-up de McGill',
    kind: 'hold',
    group: 'core',
    weighted: false,
    technique: 'Una pierna doblada, manos bajo la lumbar. Sube solo unos cm la cabeza y los hombros, sin aplanar la espalda.',
    alternatives: ['dead-bug'],
  },
  {
    id: 'plancha-lateral',
    name: 'Plancha lateral',
    kind: 'hold',
    group: 'core',
    weighted: false,
    technique: 'Cuerpo recto de cabeza a rodillas o pies. Empieza apoyando las rodillas. Cadera arriba, sin girar.',
    alternatives: ['pallof-press', 'suitcase-carry'],
  },
  {
    id: 'bird-dog',
    name: 'Bird dog',
    kind: 'hold',
    group: 'core',
    weighted: false,
    technique: 'En cuadrupedia, estira brazo y pierna contraria. La cadera no gira: imagina un vaso de agua sobre la lumbar.',
    alternatives: ['dead-bug'],
  },

  // Pecho
  {
    id: 'press-pecho-maquina',
    name: 'Press de pecho en máquina',
    kind: 'reps',
    group: 'pecho',
    weighted: true,
    technique: 'Espalda apoyada en el respaldo, pies firmes. Empuja sin despegar la lumbar ni arquear.',
    alternatives: ['press-inclinado-maquina', 'press-mancuernas-plano'],
  },
  {
    id: 'press-inclinado-mancuernas',
    name: 'Press inclinado con mancuernas',
    kind: 'reps',
    group: 'pecho',
    weighted: true,
    weightStep: 1,
    technique: 'Banco a 30°. Sube las mancuernas a los muslos sentado antes de reclinarte; no las levantes desde el suelo doblado.',
    alternatives: ['press-inclinado-maquina', 'press-pecho-maquina'],
  },
  {
    id: 'pec-deck',
    name: 'Pec deck',
    kind: 'reps',
    group: 'pecho',
    weighted: true,
    technique: 'Espalda pegada al respaldo, codos levemente flexionados. Junta las manos sin adelantar los hombros.',
    alternatives: ['aperturas-mancuernas', 'press-pecho-maquina'],
  },
  {
    id: 'press-inclinado-maquina',
    name: 'Press de pecho inclinado en máquina',
    kind: 'reps',
    group: 'pecho',
    weighted: true,
    technique: 'Espalda apoyada, empuja hacia arriba y adelante sin arquear la lumbar.',
    alternatives: ['press-pecho-maquina', 'press-inclinado-mancuernas'],
  },
  {
    id: 'press-mancuernas-plano',
    name: 'Press con mancuernas en banco plano',
    kind: 'reps',
    group: 'pecho',
    weighted: true,
    weightStep: 1,
    technique: 'Pies en el suelo o sobre el banco, lumbar neutra. Sube las mancuernas sentado antes de acostarte.',
    alternatives: ['press-pecho-maquina'],
  },
  {
    id: 'aperturas-mancuernas',
    name: 'Aperturas con mancuernas en banco plano',
    kind: 'reps',
    group: 'pecho',
    weighted: true,
    weightStep: 1,
    technique: 'Peso ligero, codos levemente doblados. Baja hasta sentir el estiramiento, sin arquear.',
    alternatives: ['pec-deck'],
  },

  // Hombro
  {
    id: 'press-hombro-maquina',
    name: 'Press de hombro en máquina sentado',
    kind: 'reps',
    group: 'hombro',
    weighted: true,
    technique: 'Espalda completa contra el respaldo, abdomen firme. Empuja sin arquear la zona lumbar.',
    alternatives: ['press-hombro-mancuernas-sentado'],
  },
  {
    id: 'elevaciones-laterales-sentado',
    name: 'Elevaciones laterales sentado',
    kind: 'reps',
    group: 'hombro',
    weighted: true,
    weightStep: 1,
    technique: 'Sentado y erguido, sube hasta la altura de los hombros sin balancear el tronco.',
    alternatives: ['elevaciones-laterales-polea'],
  },
  {
    id: 'press-hombro-mancuernas-sentado',
    name: 'Press de hombro con mancuernas sentado con respaldo',
    kind: 'reps',
    group: 'hombro',
    weighted: true,
    weightStep: 1,
    technique: 'Respaldo vertical, espalda pegada. Peso moderado, sin arquear para terminar la repetición.',
    alternatives: ['press-hombro-maquina'],
  },
  {
    id: 'elevaciones-laterales-polea',
    name: 'Elevación lateral en polea a una mano',
    kind: 'reps',
    group: 'hombro',
    weighted: true,
    technique: 'De pie de lado a la polea, tronco quieto. Sube el brazo hasta la altura del hombro.',
    alternatives: ['elevaciones-laterales-sentado'],
  },
  {
    id: 'face-pull',
    name: 'Face pull',
    kind: 'reps',
    group: 'hombro',
    weighted: true,
    technique: 'Cuerda a la altura de la cara. Tira hacia los ojos separando las manos; tronco quieto, sin echarte atrás.',
    alternatives: ['pec-deck-invertido', 'pajaros-banco-inclinado'],
  },
  {
    id: 'pec-deck-invertido',
    name: 'Pec deck invertido',
    kind: 'reps',
    group: 'hombro',
    weighted: true,
    technique: 'Pecho contra el respaldo, brazos casi rectos. Abre llevando los codos atrás sin despegar el pecho.',
    alternatives: ['face-pull', 'pajaros-banco-inclinado'],
  },
  {
    id: 'pajaros-banco-inclinado',
    name: 'Pájaros con pecho apoyado en banco inclinado',
    kind: 'reps',
    group: 'hombro',
    weighted: true,
    weightStep: 1,
    technique: 'Pecho apoyado en el banco, mancuernas ligeras. Abre los brazos sin despegar el pecho.',
    alternatives: ['pec-deck-invertido'],
  },

  // Tríceps
  {
    id: 'triceps-polea',
    name: 'Tríceps en polea',
    kind: 'reps',
    group: 'triceps',
    weighted: true,
    technique: 'Codos pegados al cuerpo, tronco erguido. Estira los brazos sin inclinarte sobre la polea.',
    alternatives: ['fondos-maquina', 'rompecraneos-mancuernas'],
  },
  {
    id: 'fondos-maquina',
    name: 'Fondos en máquina sentado',
    kind: 'reps',
    group: 'triceps',
    weighted: true,
    technique: 'Espalda apoyada, empuja hacia abajo con los codos cerca del cuerpo.',
    alternatives: ['triceps-polea'],
  },
  {
    id: 'rompecraneos-mancuernas',
    name: 'Extensión de tríceps acostado con mancuernas',
    kind: 'reps',
    group: 'triceps',
    weighted: true,
    weightStep: 1,
    technique: 'Acostado en banco plano, codos apuntando al techo. Baja las mancuernas junto a la cabeza.',
    alternatives: ['triceps-polea'],
  },

  // Espalda
  {
    id: 'jalon-pecho',
    name: 'Jalón al pecho',
    kind: 'reps',
    group: 'espalda',
    weighted: true,
    technique: 'Muslos trabados, tronco casi vertical. Lleva la barra al pecho bajando los codos, sin balancearte.',
    alternatives: ['dominadas-asistidas', 'jalon-agarre-neutro'],
  },
  {
    id: 'remo-maquina-apoyo-pecho',
    name: 'Remo en máquina con apoyo de pecho',
    kind: 'reps',
    group: 'espalda',
    weighted: true,
    technique: 'Pecho pegado al apoyo todo el tiempo. Tira con los codos y junta los omóplatos.',
    alternatives: ['remo-polea-sentado', 'remo-mancuerna-banco-inclinado'],
  },
  {
    id: 'remo-mancuerna-una-mano',
    name: 'Remo con mancuerna a una mano, apoyado en banco',
    kind: 'reps',
    group: 'espalda',
    weighted: true,
    weightStep: 1,
    technique: 'Mano y rodilla en el banco, espalda plana. Tira la mancuerna hacia la cadera sin girar el tronco.',
    alternatives: ['remo-maquina-apoyo-pecho', 'remo-mancuerna-banco-inclinado'],
  },
  {
    id: 'remo-polea-sentado',
    name: 'Remo en polea sentado',
    kind: 'reps',
    group: 'espalda',
    weighted: true,
    technique: 'Rodillas levemente dobladas, tronco quieto y erguido. Tira con los codos; no te balancees adelante y atrás.',
    alternatives: ['remo-maquina-apoyo-pecho'],
  },
  {
    id: 'dominadas-asistidas',
    name: 'Dominadas asistidas',
    kind: 'reps',
    group: 'espalda',
    weighted: true,
    assisted: true,
    technique: 'Rodillas en la plataforma, cuerpo largo. Sube llevando el pecho a la barra, sin balanceo. El peso es la asistencia.',
    alternatives: ['jalon-pecho'],
  },
  {
    id: 'jalon-agarre-neutro',
    name: 'Jalón con agarre neutro',
    kind: 'reps',
    group: 'espalda',
    weighted: true,
    technique: 'Palmas enfrentadas, tronco casi vertical. Baja los codos hacia las costillas.',
    alternatives: ['jalon-pecho'],
  },
  {
    id: 'remo-mancuerna-banco-inclinado',
    name: 'Remo con mancuernas con pecho apoyado en banco inclinado',
    kind: 'reps',
    group: 'espalda',
    weighted: true,
    weightStep: 1,
    technique: 'Pecho apoyado en banco a 30–45°. Tira las mancuernas hacia la cadera sin despegar el pecho.',
    alternatives: ['remo-maquina-apoyo-pecho'],
  },

  // Bíceps
  {
    id: 'curl-banco-inclinado',
    name: 'Curl en banco inclinado',
    kind: 'reps',
    group: 'biceps',
    weighted: true,
    weightStep: 1,
    technique: 'Espalda apoyada en el banco, brazos colgando. Sube sin adelantar los codos.',
    alternatives: ['curl-predicador', 'biceps-polea'],
  },
  {
    id: 'curl-martillo-sentado',
    name: 'Curl martillo sentado',
    kind: 'reps',
    group: 'biceps',
    weighted: true,
    weightStep: 1,
    technique: 'Sentado con respaldo, palmas enfrentadas. Sube sin balancear el tronco.',
    alternatives: ['curl-predicador', 'biceps-polea'],
  },
  {
    id: 'biceps-polea',
    name: 'Bíceps en polea',
    kind: 'reps',
    group: 'biceps',
    weighted: true,
    technique: 'Codos pegados al cuerpo, tronco erguido y quieto. Sube y baja controlado.',
    alternatives: ['curl-banco-inclinado', 'curl-predicador'],
  },
  {
    id: 'curl-predicador',
    name: 'Curl en banco Scott (predicador)',
    kind: 'reps',
    group: 'biceps',
    weighted: true,
    technique: 'Brazos apoyados en el pad, pecho contra el apoyo. Baja controlado sin estirar del todo.',
    alternatives: ['biceps-polea'],
  },

  // Pierna
  {
    id: 'prensa',
    name: 'Prensa',
    kind: 'reps',
    group: 'cuadriceps',
    weighted: true,
    technique: 'Baja solo hasta donde la lumbar siga pegada al respaldo. Si la pelvis se despega, recorta el rango.',
    alternatives: ['belt-squat', 'prensa-una-pierna'],
  },
  {
    id: 'belt-squat',
    name: 'Belt squat',
    kind: 'reps',
    group: 'cuadriceps',
    weighted: true,
    technique: 'El cinturón carga la cadera, no la columna. Tronco erguido, baja controlado.',
    alternatives: ['prensa', 'prensa-una-pierna'],
  },
  {
    id: 'extension-cuadriceps',
    name: 'Extensión de cuádriceps',
    kind: 'reps',
    group: 'cuadriceps',
    weighted: true,
    technique: 'Espalda apoyada, agarra las manijas. Estira la rodilla y baja lento.',
    alternatives: ['prensa', 'prensa-una-pierna'],
  },
  {
    id: 'prensa-una-pierna',
    name: 'Prensa a una pierna',
    kind: 'reps',
    group: 'cuadriceps',
    weighted: true,
    technique: 'Pie al centro de la plataforma, rango corto. La pelvis no se despega ni rota.',
    alternatives: ['prensa', 'belt-squat'],
  },
  {
    id: 'curl-femoral-sentado',
    name: 'Curl femoral sentado',
    kind: 'reps',
    group: 'isquios',
    weighted: true,
    technique: 'Rodilla alineada con el eje de la máquina, pad sobre los muslos. Espalda apoyada.',
    alternatives: ['curl-femoral-tumbado', 'hip-thrust'],
  },
  {
    id: 'curl-femoral-tumbado',
    name: 'Curl femoral tumbado',
    kind: 'reps',
    group: 'isquios',
    weighted: true,
    technique: 'Cadera pegada al banco, sin arquear la lumbar al subir. Peso moderado.',
    alternatives: ['curl-femoral-sentado'],
  },
  {
    id: 'abductores-maquina',
    name: 'Abductores en máquina',
    kind: 'reps',
    group: 'gluteo',
    weighted: true,
    technique: 'Espalda apoyada, abre las piernas controlado y vuelve sin dejar caer el peso.',
    alternatives: ['abduccion-cadera-polea', 'caminata-lateral-banda'],
  },
  {
    id: 'hip-thrust',
    name: 'Hip thrust',
    kind: 'reps',
    group: 'gluteo',
    weighted: true,
    technique: 'Espalda alta en el banco, mentón al pecho. Sube con el glúteo y no arquees la lumbar arriba.',
    alternatives: ['puente-gluteo', 'patada-gluteo-polea'],
  },
  {
    id: 'patada-gluteo-polea',
    name: 'Patada de glúteo en polea',
    kind: 'reps',
    group: 'gluteo',
    weighted: true,
    technique: 'Apóyate en la máquina, abdomen firme. Lleva la pierna atrás sin arquear la zona lumbar.',
    alternatives: ['puente-gluteo', 'hip-thrust'],
  },
  {
    id: 'puente-gluteo',
    name: 'Puente de glúteo en el suelo',
    kind: 'reps',
    group: 'gluteo',
    weighted: true,
    technique: 'Acostado, pies cerca de la cadera. Sube apretando glúteos hasta alinear rodillas, cadera y hombros.',
    alternatives: ['hip-thrust'],
  },
  {
    id: 'abduccion-cadera-polea',
    name: 'Abducción de cadera en polea',
    kind: 'reps',
    group: 'gluteo',
    weighted: true,
    technique: 'De pie, apoyado en la máquina. Lleva la pierna hacia afuera sin inclinar el tronco.',
    alternatives: ['abductores-maquina'],
  },
  {
    id: 'caminata-lateral-banda',
    name: 'Caminata lateral con banda',
    kind: 'reps',
    group: 'gluteo',
    weighted: false,
    technique: 'Banda sobre las rodillas, semiflexión ligera. Pasos cortos sin juntar los pies.',
    alternatives: ['abductores-maquina'],
  },
  {
    id: 'pantorrilla-sentado',
    name: 'Pantorrilla sentado',
    kind: 'reps',
    group: 'pantorrilla',
    weighted: true,
    technique: 'Pad sobre los muslos, sube en puntas y baja lento hasta estirar.',
    alternatives: ['pantorrilla-prensa'],
  },
  {
    id: 'pantorrilla-prensa',
    name: 'Pantorrilla en prensa',
    kind: 'reps',
    group: 'pantorrilla',
    weighted: true,
    technique: 'Puntas en el borde de la plataforma, rodillas casi rectas. Empuja con los dedos sin doblar la espalda.',
    alternatives: ['pantorrilla-sentado'],
  },

  // Core
  {
    id: 'pallof-press',
    name: 'Pallof press',
    kind: 'reps',
    group: 'core',
    weighted: true,
    technique: 'De lado a la polea, empuja al frente y aguanta sin dejar que el tronco gire.',
    alternatives: ['plancha-lateral', 'dead-bug'],
  },
  {
    id: 'dead-bug',
    name: 'Dead bug',
    kind: 'reps',
    group: 'core',
    weighted: false,
    technique: 'Lumbar pegada al suelo todo el tiempo. Estira brazo y pierna contraria lento.',
    alternatives: ['bird-dog', 'curl-up-mcgill'],
  },
  {
    id: 'suitcase-carry',
    name: 'Suitcase carry',
    kind: 'distance',
    group: 'core',
    weighted: true,
    weightStep: 1,
    technique: 'Mancuerna en una mano, camina erguido sin inclinarte hacia el peso.',
    alternatives: ['pallof-press', 'plancha-lateral'],
  },
  {
    id: 'plancha-frontal',
    name: 'Plancha frontal',
    kind: 'hold',
    group: 'core',
    weighted: false,
    technique: 'Antebrazos y puntas, glúteos apretados. Cuerpo recto: sin hundir ni subir la cadera.',
    alternatives: ['dead-bug', 'bird-dog'],
  },

  // Cierre
  {
    id: 'caminata-cinta',
    name: 'Caminata en cinta inclinada',
    kind: 'hold',
    group: 'cardio',
    weighted: false,
    technique: 'Paso cómodo, tronco erguido, sin agarrarte de la cinta. 15–20 minutos.',
    alternatives: [],
  },
];

interface MediaEntry {
  image?: string;
  technique?: string;
}

const mediaMap = media as Record<string, MediaEntry>;

export const EXERCISES: Exercise[] = base.map((exercise) => {
  const extracted = mediaMap[exercise.id];
  if (!extracted) return exercise;
  return {
    ...exercise,
    image: extracted.image ?? exercise.image,
    technique: extracted.technique?.trim() || exercise.technique,
  };
});

export const EXERCISES_BY_ID: Record<string, Exercise> = Object.fromEntries(
  EXERCISES.map((exercise) => [exercise.id, exercise]),
);

export const WARMUP_IDS = ['curl-up-mcgill', 'plancha-lateral', 'bird-dog'] as const;
export const WALK_ID = 'caminata-cinta';

/** Esquema de series descendentes del calentamiento McGill. */
export const MCGILL_SERIES = [5, 3, 1] as const;

export const DEFAULT_WEIGHT_STEP = 2.5;

export function youtubeUrl(name: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} técnica`)}`;
}

export const GROUP_LABELS: Record<MuscleGroup, string> = {
  pecho: 'Pecho',
  hombro: 'Hombro',
  triceps: 'Tríceps',
  espalda: 'Espalda',
  biceps: 'Bíceps',
  cuadriceps: 'Cuádriceps',
  isquios: 'Isquios',
  gluteo: 'Glúteo',
  pantorrilla: 'Pantorrilla',
  core: 'Core',
  cardio: 'Cardio',
};
