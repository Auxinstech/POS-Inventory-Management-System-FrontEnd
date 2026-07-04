import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { produce } from "immer";
import { getTokens } from "Utils/auth";

export interface IUserRole {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot?: {
    model_type: string;
    model_id: number;
    role_id: number;
  };
}

export interface IUserStore {
  id: number;
  name: string;
  slug: string;
  address: string;
  postal_code: string;
  url: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  pivot?: {
    user_id: number;
    store_id: number;
  };
}

export interface IUserObject {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    otp: string;
    status: string;
    created_at: string;
    updated_at: string;
    roles: IUserRole[];
    stores: IUserStore[];
  };
}

const initialState: IUserObject = {
  token: "",
  user: {
    id: 0,
    name: "",
    email: "",
    email_verified_at: "",
    otp: "",
    status: "",
    created_at: "",
    updated_at: "",
    roles: [],
    stores: [],
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logoutUser() {},
    loginUser(state, action: PayloadAction<{ email: string }>) {},
    verifyUser(state, action: PayloadAction<{ email: string; otp: string }>) {},
    setUserLoginData(
      state,
      action: PayloadAction<Pick<IUserObject, "user" | "token">>
    ) {
      const payload = action.payload;

      return produce(state, (draftState) => {
        draftState.token = payload.token;
        draftState.user = payload.user;
      });
    },
    getUserBasicData(state) {
      return produce(state, (draftState) => {
        draftState.token = getTokens().AccessToken;
      });
    },
    setUserID(state, action: PayloadAction<number>) {
      state.user.id = action.payload;
    },
    setRoles(state, action: PayloadAction<IUserRole[]>) {
      state.user.roles = action.payload;
    },
    setStores(state, action: PayloadAction<IUserStore[]>) {
      state.user.stores = action.payload;
    },
    setUserDetails(state, action: PayloadAction<any>) {
      state.user.name = action.payload.name;
      state.user.email = action.payload.email;
    },
  },
});

export const {
  logoutUser,
  loginUser,
  verifyUser,
  setUserLoginData,
  getUserBasicData,
  setUserID,
  setRoles,
  setStores,
  setUserDetails,
} = userSlice.actions;

export default userSlice.reducer;
export { initialState };
