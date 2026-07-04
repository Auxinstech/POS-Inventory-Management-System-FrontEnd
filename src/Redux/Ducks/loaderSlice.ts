import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { produce } from "immer";
import { ComponentType, LazyExoticComponent } from "react";

interface ILoader {
  toggle: boolean
  loadingText: string
}

const InitialState: ILoader = {
  toggle: false,
  loadingText: ""
};

const LoaderSlice = createSlice({
  name: "loader",
  initialState: InitialState,
  reducers: {
    toggleLoader(state, action: PayloadAction<boolean>) {
      return produce(state, (draftState) => {
        draftState.toggle = action.payload;
        draftState.loadingText = "";
      });
    },
    loaderText(state, action: PayloadAction<string>) {
      return produce(state, (draftState) => {
        draftState.loadingText = action.payload;
      });
    }
  },
});

export const { toggleLoader, loaderText } = LoaderSlice.actions;

export default LoaderSlice.reducer;
