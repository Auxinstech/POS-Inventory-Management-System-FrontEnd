import { PayloadAction } from "@reduxjs/toolkit";
import { call, put } from "redux-saga/effects";
import { setToast } from "../../Ducks/toastSlice";
import {
  setRoleList,
  addRole,
  updateRole,
  deleteRole,
  setPermissionList,
  addPermission,
  updatePermission,
  deletePermission,
  replaceRole,
  IRole,
} from "../../Ducks/rpSlice";
import {
  requestRolesList,
  requestCreateRole,
  requestUpdateRole,
  requestDeleteRole,
  requestPermissionsList,
  requestCreatePermission,
  requestUpdatePermission,
  requestDeleteRPermission,
} from "../Requests/rolesPermission";
import { toggleLoader } from "../../Ducks/loaderSlice";
import {
  IRoleCreateUpdate,
  IPermissionCreateUpdate,
} from "../../Ducks/rpSlice";

export function* handleFetchRoles(): any {
  try {
    yield put(toggleLoader(true));
    const res = yield call(requestRolesList);
    yield put(setRoleList(res.data));
  } catch (error: any) {
    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to load roles",
        type: "error",
      })
    );
  } finally {
    yield put(toggleLoader(false));
  }
}

export function* handleCreateRole({
  payload,
  meta,
}: PayloadAction<IRoleCreateUpdate, string, { onSuccess?: () => void }>): any {
  try {
    yield put(toggleLoader(true));

    const response = yield call(requestCreateRole, payload);

    const res: IRole = response.data; // ✅ only the role object

    const roleWithPermissions: IRole = {
      ...res,
      permissions: res.permissions ?? [],
    };

    yield put(addRole(roleWithPermissions));

    yield put(
      setToast({ message: "Role created successfully", type: "success" })
    );
    if (meta?.onSuccess) yield call(meta.onSuccess);
  } catch (error: any) {
    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to create role",
        type: "error",
      })
    );
  } finally {
    yield put(toggleLoader(false));
  }
}

// export function* handleCreateRole({
//   payload,
//   meta,
// }: PayloadAction<IRoleCreateUpdate, string, { onSuccess?: () => void }>): any {
//   try {
//     yield put(toggleLoader(true));
//     const res = yield call(requestCreateRole, payload);
//     yield put(addRole(res.data));
//     yield put(
//       setToast({ message: "Role created successfully", type: "success" })
//     );
//     if (meta?.onSuccess) yield call(meta.onSuccess);
//   } catch (error: any) {
//     yield put(
//       setToast({
//         message: error.response?.data?.message || "Failed to create role",
//         type: "error",
//       })
//     );
//   } finally {
//     yield put(toggleLoader(false));
//   }
// }

export function* handleUpdateRole({
  payload,
  meta,
}: PayloadAction<
  { id: number; data: IRoleCreateUpdate },
  string,
  { onSuccess?: () => void }
>): any {
  try {
    yield put(toggleLoader(true));
    const res = yield call(requestUpdateRole, {
      id: payload.id,
      data: payload.data,
    });
    yield put(replaceRole(res.data));

    yield put(
      setToast({ message: "Role updated successfully", type: "success" })
    );
    if (meta?.onSuccess) yield call(meta.onSuccess);
  } catch (error: any) {
    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to update role",
        type: "error",
      })
    );
  } finally {
    yield put(toggleLoader(false));
  }
}

export function* handleDeleteRole({
  payload,
  meta,
}: PayloadAction<number, string, { onSuccess?: () => void }>): any {
  try {
    yield put(toggleLoader(true));
    yield call(requestDeleteRole, payload);
    yield put(
      setToast({ message: "Role deleted successfully", type: "success" })
    );
    if (meta?.onSuccess) yield call(meta.onSuccess);
  } catch (error: any) {
    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to delete role",
        type: "error",
      })
    );
  } finally {
    yield put(toggleLoader(false));
  }
}

export function* handleFetchPermissions(): any {
  try {
    yield put(toggleLoader(true));
    const res = yield call(requestPermissionsList);
    yield put(setPermissionList(res.data));
  } catch (error: any) {
    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to load permissions",
        type: "error",
      })
    );
  } finally {
    yield put(toggleLoader(false));
  }
}

export function* handleCreatePermission({
  payload,
  meta,
}: PayloadAction<
  IPermissionCreateUpdate,
  string,
  { onSuccess?: () => void }
>): any {
  try {
    yield put(toggleLoader(true));
    const res = yield call(
      requestCreatePermission as (data: IPermissionCreateUpdate) => any,
      payload
    );
    yield put(addPermission(res.data));
    yield put(
      setToast({ message: "Permission created successfully", type: "success" })
    );
    if (meta?.onSuccess) yield call(meta.onSuccess);
  } catch (error: any) {
    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to create permission",
        type: "error",
      })
    );
  } finally {
    yield put(toggleLoader(false));
  }
}

export function* handleUpdatePermission({
  payload,
  meta,
}: PayloadAction<
  { id: number; data: IPermissionCreateUpdate },
  string,
  { onSuccess?: () => void }
>): any {
  try {
    yield put(toggleLoader(true));
    const res = yield call(
      requestUpdatePermission as (args: {
        id: number;
        data: IPermissionCreateUpdate;
      }) => any,
      { id: payload.id, data: payload.data }
    );
    yield put(
      setToast({
        message: "Permission updated successfully",
        type: "success",
      })
    );
    if (meta?.onSuccess) yield call(meta.onSuccess);
    yield put(toggleLoader(false));
  } catch (error: any) {
    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to update permission",
        type: "error",
      })
    );
  }
}

export function* handleDeletePermission({
  payload,
  meta,
}: PayloadAction<number, string, { onSuccess?: () => void }>): any {
  try {
    yield put(toggleLoader(true));
    yield call(requestDeleteRPermission, payload);
    yield put(
      setToast({
        message: "Permission deleted successfully",
        type: "success",
      })
    );
    if (meta?.onSuccess) yield call(meta.onSuccess);
  } catch (error: any) {
    yield put(
      setToast({
        message: error.response?.data?.message || "Failed to delete permission",
        type: "error",
      })
    );
  } finally {
    yield put(toggleLoader(false));
  }
}
