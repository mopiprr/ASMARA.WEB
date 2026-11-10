export function isForbiddenError(err: unknown) {
  return (err as { response?: { status?: number } }).response?.status === 403;
}