import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { produce } from "immer";
import { ComponentType, LazyExoticComponent } from "react";

interface IBeepSound {
  value: number;
}

const InitialState: IBeepSound = {
  value: 0,
};

const BeepSoundSlice = createSlice({
  name: "Beep",
  initialState: InitialState,
  reducers: {
    setBeepCount(state, action: PayloadAction<number>) {
      state.value = action.payload;
    },
    decrementBeepCount(state) {
      if (state.value > 0) state.value -= 1;
    },
  },
});

export const { setBeepCount, decrementBeepCount } = BeepSoundSlice.actions;

export default BeepSoundSlice.reducer;
