import { useId } from 'react';

// Campo de formulário acessível. onChange(name, valor) — a máscara (se houver) é aplicada aqui.
export default function Field({ label, name, value, onChange, error, as = 'input', type = 'text', options = [], mask, wide, hint, placeholder = 'Selecione', required, ...rest }) {
  const id = useId();
  const handle = (e) => onChange(name, mask ? mask(e.target.value) : e.target.value);
  const common = {
    id,
    name,
    value: value ?? '',
    onChange: handle,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined,
    className: 'input',
    ...rest,
  };

  let control;
  if (as === 'select') {
    control = (
      <select {...common}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (as === 'textarea') {
    control = <textarea rows={3} {...common} />;
  } else {
    control = <input type={type} {...common} />;
  }

  return (
    <div className={`field${wide ? ' field--wide' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="field__req" aria-hidden="true"> *</span>}
      </label>
      {control}
      {hint && !error && (
        <small id={`${id}-hint`} className="field__hint">
          {hint}
        </small>
      )}
      {error && (
        <small id={`${id}-error`} className="field__error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
