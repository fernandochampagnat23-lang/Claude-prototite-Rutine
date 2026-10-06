import { describe, expect, it } from 'vitest';
import { alertLevel } from './alerts';

describe('alertas por síntomas', () => {
  it('sin síntomas no hay alerta', () => {
    expect(alertLevel([])).toBe('none');
  });

  it('hormigueo en la pierna → adelantar cita con el especialista', () => {
    expect(alertLevel(['hormigueo'])).toBe('specialist');
  });

  it('adormecimiento en la pierna → adelantar cita con el especialista', () => {
    expect(alertLevel(['adormecimiento_pierna'])).toBe('specialist');
  });

  it.each([['debilidad'], ['esfinteres'], ['entrepierna']] as const)('%s → urgencias', (symptom) => {
    expect(alertLevel([symptom])).toBe('emergency');
  });

  it('urgencias tiene prioridad sobre el aviso al especialista', () => {
    expect(alertLevel(['hormigueo', 'entrepierna'])).toBe('emergency');
  });
});
