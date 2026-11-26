export function getErrorMessage(error, fallback = 'Ocorreu um erro inesperado. Tente novamente.') {
  return error?.message || fallback;
}
