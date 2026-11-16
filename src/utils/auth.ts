export function getCurrentUserRoles(): string[] {
  try {
    const raw = sessionStorage.getItem('user');

    if (!raw) return [];

    const user = JSON.parse(raw) as { roles?: { roleCode: string }[] };

    return user.roles?.map((role) => role.roleCode) ?? [];
  } catch {
    return [];
  }
}

// true kalau user punya salah satu role yang diminta.
export function hasAnyRole(roleCodes: string[]) {
  const roles = getCurrentUserRoles();

  return roleCodes.some((code) => roles.includes(code));
}