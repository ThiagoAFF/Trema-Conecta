import { Check } from 'lucide-react';
import { ETAPAS_COM_CONCLUIDO } from '../../constants/domain';

export default function EtapaStepper({ etapaAtual }) {
  const current = ETAPAS_COM_CONCLUIDO.findIndex((e) => e.value === etapaAtual);
  return (
    <ol className="stepper" aria-label="Etapas do lote">
      {ETAPAS_COM_CONCLUIDO.map((etapa, index) => {
        const state = index < current || etapaAtual === 'concluido' ? 'done' : index === current ? 'current' : 'todo';
        return (
          <li key={etapa.value} className={`stepper__item is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="stepper__dot">{state === 'done' ? <Check size={14} /> : index + 1}</span>
            <span className="stepper__label">{etapa.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
