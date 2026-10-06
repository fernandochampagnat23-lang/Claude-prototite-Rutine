import { lazy, Suspense } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation, Link } from 'react-router-dom';
import { BookOpen, CalendarDays, Dumbbell, LineChart, Settings as SettingsIcon } from 'lucide-react';
import { Today } from './screens/Today';
import { Routine } from './screens/Routine';
import { Guide } from './screens/Guide';
import { SettingsScreen } from './screens/Settings';

// Progreso carga los gráficos (la parte más pesada) solo cuando se abre.
const Progress = lazy(() => import('./screens/Progress').then((m) => ({ default: m.Progress })));

const TABS = [
  { to: '/hoy', label: 'Hoy', icon: Dumbbell },
  { to: '/rutina', label: 'Rutina', icon: CalendarDays },
  { to: '/progreso', label: 'Progreso', icon: LineChart },
  { to: '/guia', label: 'Guía', icon: BookOpen },
];

const TITLES: Record<string, string> = {
  '/hoy': 'Hoy',
  '/rutina': 'Rutina',
  '/progreso': 'Progreso',
  '/guia': 'Guía',
  '/ajustes': 'Ajustes',
};

export default function App() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? 'Rutina L5';

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <header className="pt-safe sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <h1 className="text-xl font-bold">{title}</h1>
          <Link
            to="/ajustes"
            aria-label="Ajustes"
            className="-mr-2 flex h-12 w-12 items-center justify-center rounded-xl text-muted active:bg-surface-2"
          >
            <SettingsIcon size={24} />
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 pb-40 pt-4">
        <Routes>
          <Route path="/" element={<Navigate to="/hoy" replace />} />
          <Route path="/hoy" element={<Today />} />
          <Route path="/rutina" element={<Routine />} />
          <Route
            path="/progreso"
            element={
              <Suspense fallback={<p className="text-muted">Cargando…</p>}>
                <Progress />
              </Suspense>
            }
          />
          <Route path="/guia" element={<Guide />} />
          <Route path="/ajustes" element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to="/hoy" replace />} />
        </Routes>
      </main>

      <nav
        aria-label="Secciones"
        className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 backdrop-blur"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold ${
                  isActive ? 'text-accent' : 'text-muted'
                }`
              }
            >
              <Icon size={24} aria-hidden />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
