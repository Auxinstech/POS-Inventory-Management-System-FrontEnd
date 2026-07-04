import { IRoleCreateUpdate } from "../../Ducks/rpSlice";
import { get, post, remove, put } from "../../../Utils/axios";

let rolesController: AbortController | null = null;
let permissionsController: AbortController | null = null;

export const requestRolesList = () => {
  if (rolesController) {
    rolesController.abort();
  }

  rolesController = new AbortController();

  return get("roles", {
    signal: rolesController.signal,
  });
};

export const requestPermissionsList = () => {
  if (permissionsController) {
    permissionsController.abort();
  }

  permissionsController = new AbortController();

  return get("permissions", {
    signal: permissionsController.signal,
  });
};

// export function requestRolesList(): any {
//   return get("roles");
// }

export function requestCreateRole(params: IRoleCreateUpdate): any {
  return post("roles", params);
}

export function requestUpdateRole({
  id,
  data,
}: {
  id: number;
  data: IRoleCreateUpdate;
}): any {
  return put(`roles/${id}`, data);
}

export function requestDeleteRole(params: number): any {
  return remove(`roles/${params}`);
}

// export function requestPermissionsList(): any {
//   return get("permissions");
// }

export function requestCreatePermission(params: IRoleCreateUpdate): any {
  return post("permissions", params);
}

export function requestUpdatePermission({
  id,
  data,
}: {
  id: number;
  data: IRoleCreateUpdate;
}): any {
  return put(`permissions/${id}`, data);
}

export function requestDeleteRPermission(params: number): any {
  return remove(`permissions/${params}`);
}
