import type { PainLocation, Symptom, Trigger } from '../types';

export const AVOID_LIST: { avoid: string; alternative: string; alternativeIds: string[] }[] = [
  { avoid: 'Sentadilla con barra', alternative: 'Prensa / belt squat', alternativeIds: ['prensa', 'belt-squat'] },
  {
    avoid: 'Peso muerto (todas las variantes)',
    alternative: 'Hip thrust / curl femoral',
    alternativeIds: ['hip-thrust', 'curl-femoral-sentado'],
  },
  {
    avoid: 'Press militar de pie',
    alternative: 'Press de hombro en máquina sentado',
    alternativeIds: ['press-hombro-maquina'],
  },
  {
    avoid: 'Remo con barra inclinado',
    alternative: 'Remo con apoyo de pecho',
    alternativeIds: ['remo-maquina-apoyo-pecho'],
  },
  { avoid: 'Good morning', alternative: 'Hip thrust', alternativeIds: ['hip-thrust'] },
  { avoid: 'Hack squat pesado', alternative: 'Prensa', alternativeIds: ['prensa'] },
  {
    avoid: 'Pantorrilla de pie con hombreras',
    alternative: 'Pantorrilla sentado',
    alternativeIds: ['pantorrilla-sentado'],
  },
  { avoid: 'Hiperextensiones', alternative: 'Bird dog', alternativeIds: ['bird-dog'] },
  {
    avoid: 'Crunches / sit-ups',
    alternative: 'Curl-up de McGill / dead bug',
    alternativeIds: ['curl-up-mcgill', 'dead-bug'],
  },
  {
    avoid: 'Russian twists / elevaciones de piernas',
    alternative: 'Pallof press / plancha lateral',
    alternativeIds: ['pallof-press', 'plancha-lateral'],
  },
];

export const DAILY_RULES: { title: string; detail: string }[] = [
  {
    title: 'Primera hora del día sin doblar la espalda',
    detail: 'Al despertar los discos están más cargados de líquido. Evita agacharte doblando la columna, por ejemplo para atarte los cordones.',
  },
  {
    title: 'Calentamiento McGill siempre',
    detail: 'Curl-up, plancha lateral y bird dog en series 5-3-1 antes de cualquier ejercicio.',
  },
  {
    title: 'La carga la mueven caderas y piernas',
    detail: 'Columna neutra. Para levantar algo del suelo, bisagra de cadera o rodilla al piso, nunca la espalda redonda.',
  },
  {
    title: 'Regla de oro',
    detail: 'Si un ejercicio manda dolor hacia la pierna, para y cámbialo por su alternativa. Si terminas con 2 puntos más de dolor que al empezar, revisa qué ejercicio lo causó.',
  },
  {
    title: 'Mochila liviana',
    detail: 'Con las dos tiras y solo lo necesario. Si pesa, divide la carga.',
  },
  {
    title: 'Muévete cada 30–45 minutos',
    detail: 'Si pasas mucho tiempo sentado, levántate y camina un par de minutos.',
  },
  {
    title: 'Camina todos los días',
    detail: 'Cierra cada sesión con 15–20 minutos en cinta inclinada a paso cómodo.',
  },
  {
    title: 'Nada de llegar al fallo con dolor',
    detail: 'Deja 1–2 repeticiones en reserva. Activa el abdomen (bracing suave) al mover peso.',
  },
  {
    title: 'Registra estrés y sueño',
    detail: 'El dolor también sube con estrés y malas noches. Anotarlo te ayuda a ver qué te empeora.',
  },
];

export const LOCATION_LABELS: Record<PainLocation, string> = {
  lumbar: 'Lumbar',
  gluteo_izq: 'Glúteo izquierdo',
  muslo_izq: 'Muslo izquierdo',
  pantorrilla_pie_izq: 'Pantorrilla o pie izquierdo',
};

export const SYMPTOM_LABELS: Record<Symptom, string> = {
  hormigueo: 'Hormigueo en la pierna',
  adormecimiento_pierna: 'Adormecimiento en la pierna',
  debilidad: 'Debilidad marcada en la pierna',
  esfinteres: 'Pérdida de control de la orina o las heces',
  entrepierna: 'Adormecimiento en la entrepierna',
};

export const TRIGGER_LABELS: Record<Trigger, string> = {
  estres: 'Estrés',
  mochila: 'Mochila',
  movimiento_brusco: 'Movimiento brusco',
  mala_noche: 'Mala noche',
};

export const DISCLAIMER =
  'Esta app es una herramienta de seguimiento. No da diagnósticos ni reemplaza al médico ni al fisioterapeuta.';
