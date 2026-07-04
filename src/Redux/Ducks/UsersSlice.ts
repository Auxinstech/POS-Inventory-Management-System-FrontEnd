import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string;
  otp: string | null;
  status: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
  roles?: {
    id: number;
    name: string;
  }[];
  stores?: {
    id: number;
    name: string;
    slug: string;
  }[];
}

export interface IUserCreatePayload {
  name: string;
  email: string;
  password: string;
  status: "active" | "inactive";
  store_ids: number[];
  role_ids: number[];
}

interface UsersState {
  users: IUser[];
}

const initialState: UsersState = {
  users: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    fetchUserList() {},
    setUserList(state, action: PayloadAction<IUser[]>) {
      state.users = action.payload;
    },
    createUser: {
      reducer(
        state,
        action: PayloadAction<
          IUserCreatePayload,
          string,
          { onSuccess?: () => void }
        >
      ) {
        // No reducer logic; saga handles it
      },
      prepare(data: IUserCreatePayload, meta: { onSuccess?: () => void } = {}) {
        return { payload: data, meta };
      },
    },
    deleteUser(state, action: PayloadAction<number>) {
      state.users = state.users.filter((user) => user.id !== action.payload);
    },
    updateUser: {
      reducer: (
        state,
        action: PayloadAction<
          { id: number; data: IUserCreatePayload },
          string,
          { onSuccess?: (resData: any) => void } | undefined
        >
      ) => {
        const { id, data } = action.payload;
        const index = state.users.findIndex((user) => user.id === id);
        if (index !== -1) {
          state.users[index] = {
            ...state.users[index],
            ...data,
            updated_at: new Date().toISOString(),
          };
        }
      },
      prepare: (
        payload: { id: number; data: IUserCreatePayload },
        meta?: { onSuccess?: (resData: any) => void }
      ) => ({
        payload,
        meta,
      }),
    },
    addUser(state, action: PayloadAction<IUser>) {
      state.users.push(action.payload);
    },
  },
});

export const {
  fetchUserList,
  setUserList,
  createUser,
  addUser,
  deleteUser,
  updateUser,
} = userSlice.actions;

export default userSlice.reducer;
export { initialState };
