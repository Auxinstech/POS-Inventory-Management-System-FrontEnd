import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface manageState {
  ModifierGroups: any | null;
}

export const initialState: manageState = {
  ModifierGroups: null,
};

const manageSlice = createSlice({
  name: "manage",
  initialState,
  reducers: {
    setModifierGroupsData(state, action: PayloadAction<any>) {
      state.ModifierGroups = action.payload;
    },
  },
});

export const { setModifierGroupsData } = manageSlice.actions;
export default manageSlice.reducer;
