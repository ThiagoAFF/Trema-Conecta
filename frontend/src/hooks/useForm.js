import { useCallback, useRef, useState } from 'react';
import { getErrorMessage } from '../utils/errors';

// Formulário controlado com validação e envio.
// validate(values) -> { campo: 'mensagem' } (objeto vazio = válido)
export function useForm(initialValues, validate) {
  const initialRef = useRef(initialValues);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);

  const setValue = useCallback((name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  }, []);

  const reset = useCallback((next) => {
    setValues(next ?? initialRef.current);
    setErrors({});
    setServerError(null);
  }, []);

  const submit = (handler) => async (event) => {
    event?.preventDefault?.();
    const found = validate ? validate(values) : {};
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }
    setSaving(true);
    setServerError(null);
    try {
      await handler(values);
    } catch (error) {
      setServerError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return { values, errors, setValue, reset, submit, saving, serverError, setServerError };
}
