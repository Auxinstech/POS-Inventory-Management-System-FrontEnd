// hooks/useUserPermissions.ts
import { useMemo } from "react";
import { useAppSelector } from "../Hook/hooks";

export function useUserPermissions() {
  const user_roles = useAppSelector((x) => x.User.user.roles);
  const roles = useAppSelector((x) => x.rp.roles);

  return useMemo(() => {
    if (!user_roles?.length || !roles?.length) return [];

    // Normalize role IDs to numbers for consistent comparison
    const roleIds = user_roles.map((r) => Number(r.id));

    // Filter roles by IDs
    const matchedRoles = roles.filter((role) =>
      roleIds.includes(Number(role.id))
    );

    // Collect all permissions from matched roles
    const allPerms = matchedRoles.flatMap((role) => role.permissions || []);
    // Ensure unique permissions
    const uniquePermsMap = new Map<number, string>();
    for (const perm of allPerms) {
      if (!uniquePermsMap.has(Number(perm.id))) {
        uniquePermsMap.set(Number(perm.id), perm.name);
      }
    }

    return Array.from(uniquePermsMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [user_roles, roles]);
}
