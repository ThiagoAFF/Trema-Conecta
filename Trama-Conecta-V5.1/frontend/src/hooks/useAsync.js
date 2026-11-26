import { useCallback, useEffect, useRef, useState } from 'react';

// Executa uma função assíncrona ao montar e quando `deps` mudar.
// Mantém os dados anteriores durante recargas e ignora respostas atrasadas.
export function useAsync(fn, deps = []) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const requestId = useRef(0);
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const run = useCallback(async () => {
    const id = ++requestId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fnRef.current();
      if (id === requestId.current) setState({ data, loading: false, error: null });
    } catch (error) {
      if (id === requestId.current) setState((s) => ({ data: s.data, loading: false, error }));
    }
  }, []);

  useEffect(() => {
    run();
    return () => {
      requestId.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, reload: run };
}
