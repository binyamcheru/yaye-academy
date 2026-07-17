export const appRoles = ["ADMIN", "INSTRUCTOR", "LEARNER"] as const;

export type AppRole = (typeof appRoles)[number];

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && appRoles.includes(value as AppRole);
}

export function roleHomePath(role: AppRole) {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "INSTRUCTOR":
      return "/instructor";
    case "LEARNER":
      return "/dashboard";
  }
}

export function roleLabel(role: AppRole) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}
