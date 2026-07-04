import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IRole {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  permissions: IRolePermissions[];
}

export interface IRolePermissions {
  id: number;
  name: string;
  pivot: IRolePermissionPivot;
  updated_at?: string;
  permission?: IPermission;
}

export interface IRolePermissionPivot {
  role_id: number;
  permission_id: number;
}

export interface IRoleCreateUpdate {
  id?: number;
  name: string;
  permission_ids?: number[];
}

export interface IPermission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface IPermissionCreateUpdate {
  id?: number;
  name: string;
}

export interface RolePermissionState {
  roles: IRole[];
  permissions: IPermission[];
}

const initialState: RolePermissionState = {
  roles: [],
  permissions: [],
};

const rolePermissionSlice = createSlice({
  name: "rolePermission",
  initialState,
  reducers: {
    fetchRoleList() {},
    setRoleList(state, action: PayloadAction<IRole[]>) {
      state.roles = action.payload;
    },

    fetchPermissionList() {},
    setPermissionList(state, action: PayloadAction<IPermission[]>) {
      state.permissions = action.payload;
    },

    createRole: {
      reducer(
        state,
        action: PayloadAction<
          IRoleCreateUpdate,
          string,
          { onSuccess?: () => void }
        >
      ) {
        // no reducer logic needed — handled by saga via addRole
      },
      prepare(data: IRoleCreateUpdate, meta: { onSuccess?: () => void } = {}) {
        return { payload: data, meta };
      },
    },

    updateRole: {
      reducer(
        state,
        action: PayloadAction<
          { id: number; data: IRoleCreateUpdate },
          string,
          { onSuccess?: () => void }
        >
      ) {
        const { id, data } = action.payload;
        const index = state.roles.findIndex((role) => role.id === id);
        if (index !== -1) {
          const role = state.roles[index];
          // Map permission IDs to full objects with pivot
          if (!data?.permission_ids) return;
          const updatedPermissions = data?.permission_ids
            .map((permId) => {
              const perm = state.permissions.find((p) => p.id === permId);
              if (!perm) return null;
              return {
                id: perm.id,
                name: perm.name,
                pivot: {
                  role_id: id,
                  permission_id: perm.id,
                },
                permission: perm, // optional reference to the full permission
                updated_at: perm.updated_at,
              } as IRolePermissions;
            })
            .filter(Boolean) as IRolePermissions[];

          state.roles[index] = {
            ...role,
            name: data.name, // Only update valid fields
            updated_at: new Date().toISOString(),
            permissions: updatedPermissions, // fully mapped permissions
            // Do NOT update `permissions` from number[] here
          };
        }
      },
      prepare(
        payload: { id: number; data: IRoleCreateUpdate },
        meta: { onSuccess?: () => void } = {}
      ) {
        return { payload, meta };
      },
    },

    replaceRole(state, action: PayloadAction<IRole>) {
      const index = state.roles.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.roles[index] = action.payload;
      } else {
        state.roles.push(action.payload); // fallback, in case not found
      }
    },

    deleteRole(state, action: PayloadAction<number>) {
      state.roles = state.roles.filter((role) => role.id !== action.payload);
    },

    createPermission: {
      reducer(
        state,
        action: PayloadAction<
          IPermissionCreateUpdate,
          string,
          { onSuccess?: () => void }
        >
      ) {},
      prepare(
        data: IPermissionCreateUpdate,
        meta: { onSuccess?: () => void } = {}
      ) {
        return { payload: data, meta };
      },
    },

    updatePermission: {
      reducer(
        state,
        action: PayloadAction<
          { id: number; data: IPermissionCreateUpdate },
          string,
          { onSuccess?: () => void }
        >
      ) {
        const { id, data } = action.payload;
        const index = state.permissions.findIndex((perm) => perm.id === id);
        if (index !== -1) {
          state.permissions[index] = {
            ...state.permissions[index],
            ...data,
            updated_at: new Date().toISOString(),
          };
        }
      },
      prepare(
        payload: { id: number; data: IPermissionCreateUpdate },
        meta: { onSuccess?: () => void } = {}
      ) {
        return { payload, meta };
      },
    },

    deletePermission(state, action: PayloadAction<number>) {
      state.permissions = state.permissions.filter(
        (perm) => perm.id !== action.payload
      );
    },
    addRole(state, action: PayloadAction<IRole>) {
      state.roles.push(action.payload);
    },
    addPermission(state, action: PayloadAction<IRole>) {
      state.permissions.push(action.payload);
    },
  },
});

export const {
  addRole,
  addPermission,
  fetchRoleList,
  setRoleList,
  createRole,
  updateRole,
  replaceRole,
  deleteRole,
  fetchPermissionList,
  setPermissionList,
  createPermission,
  updatePermission,
  deletePermission,
} = rolePermissionSlice.actions;

export default rolePermissionSlice.reducer;
export { initialState };
