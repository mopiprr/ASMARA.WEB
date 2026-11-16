interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
      detail?: string;
      title?: string;
    };
  };
  message?: string;
}

export function isForbiddenError(err: unknown) {
  return (err as { response?: { status?: number } }).response?.status === 403;
}

export function extractApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const apiError = error as ApiErrorResponse;

  return (
    apiError.response?.data?.detail ||
    apiError.response?.data?.message ||
    apiError.response?.data?.title ||
    apiError.message ||
    fallback
  );
}
