# Rutina L5

App web móvil (PWA) para seguir una rutina de gimnasio de 5 días adaptada a una protrusión discal L5-S1: entrenar todo el cuerpo sin cargar la columna, fortalecer core y glúteos, y registrar el dolor para detectar qué lo empeora.

Funciona sin internet, se instala en el celular como una app y guarda todo en el propio teléfono (sin servidor ni cuentas).

> **Aviso:** esta app es una herramienta de seguimiento. No da diagnósticos ni reemplaza al médico ni al fisioterapeuta.

## Qué hace

**Hoy**
- Muestra el día siguiente de la rotación (Día 1 → 5, sin atarse al día de la semana). Puedes elegir otro día.
- Antes de empezar, registras el dolor (0–10), dónde está y si tienes algún síntoma de alerta.
- Calentamiento obligatorio con los Big 3 de McGill. Cada ejercicio va en series 5-3-1 con cuenta regresiva de 8 o 10 s por repetición.
- Para cada ejercicio ves foto, series × reps, clave de técnica y el botón **Ver técnica**, que abre YouTube.
- En cada serie anotas peso y reps, la marcas como hecha y arranca el descanso (90 s por defecto, editable, ±15 s). Los isométricos usan cuenta regresiva, por lado cuando corresponde.
- Botón **Me dolió** → pregunta si el dolor bajó a la pierna. Si la respuesta es sí, marca el ejercicio en rojo, sugiere parar y ofrece su reemplazo.
- Al cerrar: caminata en cinta con cronómetro, dolor post-sesión, detonantes del día (estrés, mochila, movimiento brusco, mala noche) y notas.
- También puedes registrar dolor o síntomas un día sin gimnasio.

**Rutina**: los 5 días editables. Puedes cambiar series y objetivo, reordenar, reemplazar un ejercicio por sus alternativas seguras o añadir uno del catálogo seguro.

**Progreso**
- Días seguidos sin dolor en la pierna.
- Dolor antes y después por fecha, peso por ejercicio y sesiones por semana. Cada gráfico tiene su vista de tabla.
- **Qué te empeora**: dolor medio con y sin cada detonante, y ejercicios que más veces te dolieron.

**Guía**: señales de alerta, reglas diarias y ejercicios a evitar con su alternativa.

**Ajustes**: descanso, duración del aguante McGill, recordatorio de la mañana, exportar o importar el respaldo JSON y borrar los datos.

## Reglas que aplica la app

| Regla | Qué hace |
|---|---|
| **Regla de oro** | Si un ejercicio manda dolor a la pierna, o el dolor post-sesión supera en 2 puntos o más al inicial, marca el ejercicio en rojo y sugiere reemplazarlo. Si el dolor subió y no tocaste "Me dolió" en ningún ejercicio, te pregunta cuál sospechas. |
| **Progresión** | Si completas todas las series y reps de un ejercicio dos sesiones seguidas, con el mismo peso y sin dolor en la pierna, sugiere subir entre 2,5 y 5 % (redondeado a 0,5 kg). En dominadas asistidas sugiere *bajar* la asistencia. En isométricos sin peso sugiere +5 s. |
| **Fase siguiente** | Tras 21 días sin dolor en la pierna, y con al menos una sesión en cada una de esas 3 semanas, avisa que puedes consultar al fisioterapeuta sobre bisagra ligera (peso muerto rumano con mancuernas, pull-through). **Nunca la desbloquea sola.** |
| **Hormigueo o adormecimiento en la pierna** | Aviso para adelantar la cita con el especialista. |
| **Debilidad marcada, pérdida de control de orina o heces, o adormecimiento en la entrepierna** | Pantalla roja: ve a urgencias. |

"Dolor en la pierna" es dolor en el muslo, la pantorrilla o el pie izquierdo, o un "Me dolió" que bajó a la pierna. El dolor lumbar y el de glúteo se registran y se grafican, pero no cortan la racha.

## Correrla en tu computadora

Requisitos: [Node.js](https://nodejs.org) 20.19 o superior (recomendado 22).

```bash
npm install
npm run dev
```

Abre la dirección que aparece (`http://localhost:5173`).

Para probarla en el celular **mientras desarrollas**, conéctalo a la misma red Wi-Fi y abre la dirección `Network` que muestra la terminal (por ejemplo, `http://192.168.0.10:5173`). Así puedes usarla, pero **no instalarla**: la instalación y el modo sin internet necesitan HTTPS. Para eso, despliégala (ver más abajo).

Otros comandos:

| Comando | Para qué |
|---|---|
| `npm test` | Tests de la regla de oro, progresión, alertas, racha, rotación, estadísticas, respaldo y rutina |
| `npm run build` | Compila la versión de producción en `dist/` |
| `npm run preview` | Sirve `dist/` en `http://localhost:4173`, con service worker, para probar el modo sin internet |
| `npm run typecheck` | Revisa los tipos de TypeScript |

## Fotos y claves de técnica del documento

Las fotos de los ejercicios salen de `Rutina_Gym_L5.docx`. Mientras no estén, la app muestra un dibujo de reemplazo.

1. Copia `Rutina_Gym_L5.docx` en la raíz del proyecto.
2. Ejecuta:
   ```bash
   npm run extract-docx
   ```
   El script recorre el documento en orden. Asocia cada imagen al ejercicio que se nombra junto a ella y, si no logra hacerlo por cercanía, usa el orden de aparición. Además toma las claves de técnica que empiezan con "Clave:" o "Técnica:".
3. Revisa `scripts/docx_report.txt` para confirmar que cada foto quedó con su ejercicio. Las imágenes van a `public/exercises/` y la asociación a `src/data/media.json`, que puedes corregir a mano si hace falta.
4. Haz commit de `public/exercises/` y `src/data/media.json`.

## Instalarla en el celular

Primero despliégala (GitHub Pages o Vercel) y abre la dirección **una vez con internet**. Desde ahí funciona sin conexión.

**Android (Chrome)**
1. Abre la dirección de la app.
2. Toca el menú ⋮ → **Instalar app** (o **Agregar a la pantalla principal**).
3. Ábrela desde el ícono: se ve a pantalla completa, sin barra del navegador.

**iPhone (Safari)**
1. Abre la dirección en **Safari**, que es la opción más confiable para instalar en iPhone.
2. Toca **Compartir** (cuadrado con flecha) → **Agregar a pantalla de inicio**.
3. Ábrela desde el ícono.

Las actualizaciones se descargan solas cuando abres la app con internet.

## Desplegarla gratis

### Opción A: GitHub Pages (incluida)

El repositorio ya trae el workflow `.github/workflows/deploy.yml`, que corre los tests, compila y publica.

1. En GitHub, ve a **Settings → Pages** y en **Source** elige **GitHub Actions**.
2. Lleva los cambios a la rama `main` (por ejemplo, con un pull request).
3. El workflow **Desplegar en GitHub Pages** se ejecuta solo. También puedes lanzarlo a mano desde **Actions → Desplegar en GitHub Pages → Run workflow**.
4. La app queda en `https://<tu-usuario>.github.io/<nombre-del-repo>/`.

El workflow compila con `BASE_PATH=/<nombre-del-repo>/`, para que todo funcione dentro de esa subcarpeta.

### Opción B: Vercel

1. Entra a [vercel.com](https://vercel.com) con tu cuenta de GitHub → **Add New → Project** → importa este repositorio.
2. Vercel detecta Vite solo. Si te pregunta, usa:
   - Build command: `npm run build`
   - Output directory: `dist`
3. **Deploy**. Cada push a `main` vuelve a publicar.

En Vercel no hace falta `BASE_PATH`: la app se sirve en la raíz.

## Tus datos

- Todo se guarda en IndexedDB, dentro del navegador del celular. No hay servidor ni cuenta.
- Si borras los datos del navegador o desinstalas la app, se pierde el historial. **Exporta un respaldo** de vez en cuando: **Ajustes → Respaldo → Exportar** descarga un `.json`.
- Para pasar los datos a otro celular: exporta en uno e importa en el otro (**Ajustes → Respaldo → Importar**). Importar **reemplaza** todo lo que haya en ese celular.

## Recordatorio de la mañana

- **En la app:** antes del mediodía, Hoy muestra "Primera hora del día sin doblar la espalda". Se cierra por ese día con la ✕ y se desactiva en Ajustes.
- **Con la app cerrada:** **Ajustes → Añadir aviso diario al calendario** descarga un evento diario con alarma (`.ics`). Ábrelo y agrégalo a tu calendario. En iPhone, si la descarga no se abre desde la app instalada, hazlo desde Safari.

Se usa el calendario porque una app web sin servidor no puede programar notificaciones confiables con la app cerrada, sobre todo en iPhone.

## Limitaciones conocidas

- La vibración de los temporizadores no funciona en iPhone (Safari no la permite). El pitido sí, siempre que el modo silencio esté apagado.
- Mantener la pantalla encendida durante la sesión depende del navegador. Funciona en Chrome para Android; en iPhone requiere una versión reciente de iOS y, si no funciona, conviene subir el tiempo de bloqueo automático mientras entrenas.
- El cálculo de progresión toma el peso más bajo de las series hechas, que es el criterio más conservador.

## Estructura

```
src/
  data/        catálogo de ejercicios, rutina inicial, guía, media.json (fotos del docx)
  logic/       reglas puras con tests: regla de oro, progresión, alertas, racha, rotación, estadísticas, recordatorio
  db/          IndexedDB (Dexie), acciones, edición de rutina, respaldo
  components/  piezas compartidas: temporizadores, alertas, formularios de dolor
  screens/     Hoy, Rutina, Progreso, Guía, Ajustes
scripts/       extract_docx.py
```

Stack: React 19, Vite, TypeScript, Tailwind CSS 4, Dexie (IndexedDB), Recharts, vite-plugin-pwa (Workbox) y Vitest.
